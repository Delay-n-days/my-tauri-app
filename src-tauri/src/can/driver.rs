// High-level CAN driver abstraction
use serde::{Deserialize, Serialize};
use super::ffi::{self, VciCanObj, VciInitConfig, VCI_USBCAN2, STATUS_OK};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanMessage {
    pub id: u32,
    pub data: Vec<u8>,
    pub timestamp: u32,
}

pub struct CanDriver {
    device_type: u32,
    device_ind: u32,
    channel: u32,
    extern_flag: u8,
    is_open: bool,
}

impl CanDriver {
    /// Create a new CAN driver instance
    /// extern_flag: 0 for standard frame, 1 for extended frame
    pub fn new(extern_flag: u8) -> Self {
        Self {
            device_type: VCI_USBCAN2,
            device_ind: 0,
            channel: 0,
            extern_flag,
            is_open: false,
        }
    }

    /// Open CAN device
    pub fn open(&mut self, channel: u32) -> Result<(), String> {
        if self.is_open {
            return Err("Device already open".to_string());
        }

        self.channel = channel;
        let status = ffi::vci_open_device(self.device_type, self.device_ind, channel)?;

        if status != STATUS_OK {
            return Err(format!("Failed to open device: status={}", status));
        }

        self.is_open = true;
        Ok(())
    }

    /// Initialize CAN with baudrate
    pub fn init(&mut self, baudrate: u32) -> Result<(), String> {
        if !self.is_open {
            return Err("Device not open".to_string());
        }

        let (timing0, timing1) = ffi::baudrate_to_timing(baudrate);
        let mut config = VciInitConfig::default();
        config.timing0 = timing0;
        config.timing1 = timing1;

        let status = ffi::vci_init_can(self.device_type, self.device_ind, self.channel, &config)?;
        if status != STATUS_OK {
            return Err(format!("Failed to init CAN: status={}", status));
        }

        let status = ffi::vci_start_can(self.device_type, self.device_ind, self.channel)?;
        if status != STATUS_OK {
            return Err(format!("Failed to start CAN: status={}", status));
        }

        Ok(())
    }

    /// Send CAN message
    pub fn send(&self, id: u32, data: &[u8]) -> Result<(), String> {
        if !self.is_open {
            return Err("Device not open".to_string());
        }

        if data.len() > 8 {
            return Err("Data length must be <= 8 bytes".to_string());
        }

        let mut obj = VciCanObj::default();
        obj.id = id;
        obj.extern_flag = self.extern_flag;
        obj.data_len = data.len() as u8;
        obj.data[..data.len()].copy_from_slice(data);

        let count = ffi::vci_transmit(self.device_type, self.device_ind, self.channel, &obj, 1)?;
        if count != 1 {
            return Err(format!("Failed to send: transmitted={}", count));
        }

        Ok(())
    }

    /// Receive CAN messages
    pub fn receive(&self, timeout_ms: i32) -> Result<Vec<CanMessage>, String> {
        if !self.is_open {
            return Err("Device not open".to_string());
        }

        const MAX_RECEIVE: usize = 50;
        let mut buffer = vec![VciCanObj::default(); MAX_RECEIVE];

        let count = ffi::vci_receive(
            self.device_type,
            self.device_ind,
            self.channel,
            &mut buffer,
            timeout_ms,
        )?;

        let messages: Vec<CanMessage> = buffer[..count as usize]
            .iter()
            .map(|obj| CanMessage {
                id: obj.id,
                data: obj.data[..obj.data_len as usize].to_vec(),
                timestamp: obj.timestamp,
            })
            .collect();

        Ok(messages)
    }

    /// Close CAN device
    pub fn close(&mut self) -> Result<(), String> {
        if !self.is_open {
            return Ok(());
        }

        let status = ffi::vci_close_device(self.device_type, self.device_ind)?;
        if status != STATUS_OK {
            return Err(format!("Failed to close device: status={}", status));
        }

        self.is_open = false;
        Ok(())
    }
}

impl Drop for CanDriver {
    fn drop(&mut self) {
        let _ = self.close();
    }
}
