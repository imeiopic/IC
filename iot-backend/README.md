# IO Law & Order for IoT – Backend

This directory contains backend Cloud Functions for device/user registration, policy enforcement, action logging, anomaly detection, and dispute handling.

## Functions

- **onDeviceRegister**: Triggered on new device registration.
- **enforcePolicy**: Callable function for policy checks.
- **onAction**: Triggered on new device/user action.
- **detectAnomaly**: Flags suspicious actions.
- **handleDispute**: Receives and logs disputes.

## Setup

- Deploy with Firebase Functions or adapt for your backend.
- Extend logic for your policies, anomaly detection, and workflows.
