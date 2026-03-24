// CAN module for USBCAN communication
pub mod ffi;
pub mod driver;

pub use driver::{CanDriver, CanMessage};
