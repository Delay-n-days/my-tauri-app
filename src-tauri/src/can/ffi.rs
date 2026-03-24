// FFI bindings for ControlCAN.dll (USBCAN driver)

// Device type constants
pub const VCI_USBCAN2: u32 = 4;

// Status constants
pub const STATUS_OK: u32 = 1;

// Baudrate timing configurations
// 500K: timing0=0x00, timing1=0x1C
// 250K: timing0=0x01, timing1=0x1C
pub fn baudrate_to_timing(baudrate: u32) -> (u8, u8) {
    match baudrate {
        500 => (0x00, 0x1C),
        250 => (0x01, 0x1C),
        _ => (0x00, 0x1C), // Default to 500K
    }
}

// VCI_INIT_CONFIG structure
#[repr(C)]
#[derive(Debug, Clone)]
pub struct VciInitConfig {
    pub acc_code: u32,
    pub acc_mask: u32,
    pub reserved: u32,
    pub filter: u8,
    pub timing0: u8,
    pub timing1: u8,
    pub mode: u8,
}

impl Default for VciInitConfig {
    fn default() -> Self {
        Self {
            acc_code: 0,
            acc_mask: 0xFFFFFFFF,
            reserved: 0,
            filter: 0,      // Dual filter mode
            timing0: 0x00,  // 500K default
            timing1: 0x1C,
            mode: 0,        // Normal mode
        }
    }
}

// VCI_CAN_OBJ structure
#[repr(C)]
#[derive(Debug, Clone)]
pub struct VciCanObj {
    pub id: u32,
    pub timestamp: u32,
    pub time_flag: u8,
    pub send_type: u8,
    pub remote_flag: u8,
    pub extern_flag: u8,
    pub data_len: u8,
    pub data: [u8; 8],
    pub reserved: [u8; 3],
}

impl Default for VciCanObj {
    fn default() -> Self {
        Self {
            id: 0,
            timestamp: 0,
            time_flag: 0,
            send_type: 0,      // Normal send
            remote_flag: 0,    // Data frame
            extern_flag: 0,    // Standard frame
            data_len: 8,
            data: [0; 8],
            reserved: [0; 3],
        }
    }
}

// DLL function declarations using libloading
use libloading::{Library, Symbol};
use std::sync::OnceLock;

static DLL: OnceLock<Library> = OnceLock::new();

// Load DLL once
fn get_dll() -> Result<&'static Library, String> {
    DLL.get_or_init(|| {
        // In development, DLL is in the current directory (src-tauri/)
        #[cfg(debug_assertions)]
        let dll_path = "ControlCAN.dll";

        // In production, DLL should be bundled in the resources directory
        #[cfg(not(debug_assertions))]
        let dll_path = "ControlCAN.dll";

        match unsafe { Library::new(dll_path) } {
            Ok(lib) => lib,
            Err(e) => {
                eprintln!("Failed to load ControlCAN.dll: {}", e);
                eprintln!("Current directory: {:?}", std::env::current_dir());
                panic!("Cannot load ControlCAN.dll")
            }
        }
    });

    DLL.get().ok_or_else(|| "DLL not loaded".to_string())
}

// Safe wrappers for DLL functions
pub fn vci_open_device(device_type: u32, device_ind: u32, _channel: u32) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32, u32) -> u32> = dll
            .get(b"VCI_OpenDevice")
            .map_err(|e| format!("VCI_OpenDevice not found: {}", e))?;
        Ok(func(device_type, device_ind, 0))
    }
}

pub fn vci_close_device(device_type: u32, device_ind: u32) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32) -> u32> = dll
            .get(b"VCI_CloseDevice")
            .map_err(|e| format!("VCI_CloseDevice not found: {}", e))?;
        Ok(func(device_type, device_ind))
    }
}

pub fn vci_init_can(
    device_type: u32,
    device_ind: u32,
    channel: u32,
    config: &VciInitConfig,
) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32, u32, *const VciInitConfig) -> u32> = dll
            .get(b"VCI_InitCAN")
            .map_err(|e| format!("VCI_InitCAN not found: {}", e))?;
        Ok(func(device_type, device_ind, channel, config as *const VciInitConfig))
    }
}

pub fn vci_start_can(device_type: u32, device_ind: u32, channel: u32) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32, u32) -> u32> = dll
            .get(b"VCI_StartCAN")
            .map_err(|e| format!("VCI_StartCAN not found: {}", e))?;
        Ok(func(device_type, device_ind, channel))
    }
}

pub fn vci_transmit(
    device_type: u32,
    device_ind: u32,
    channel: u32,
    obj: &VciCanObj,
    len: u32,
) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32, u32, *const VciCanObj, u32) -> u32> = dll
            .get(b"VCI_Transmit")
            .map_err(|e| format!("VCI_Transmit not found: {}", e))?;
        Ok(func(device_type, device_ind, channel, obj as *const VciCanObj, len))
    }
}

pub fn vci_receive(
    device_type: u32,
    device_ind: u32,
    channel: u32,
    buffer: &mut [VciCanObj],
    timeout: i32,
) -> Result<u32, String> {
    unsafe {
        let dll = get_dll()?;
        let func: Symbol<unsafe extern "C" fn(u32, u32, u32, *mut VciCanObj, u32, i32) -> u32> = dll
            .get(b"VCI_Receive")
            .map_err(|e| format!("VCI_Receive not found: {}", e))?;
        Ok(func(
            device_type,
            device_ind,
            channel,
            buffer.as_mut_ptr(),
            buffer.len() as u32,
            timeout,
        ))
    }
}
