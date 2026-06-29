// TypeScript declaration for gapi.client.drive
// Ensures TypeScript recognizes gapi.client.drive usage

declare namespace gapi.client {
  namespace drive {
    namespace files {
      function list(args: any): Promise<any>;
      function get(args: any): Promise<any>;
    }
  }
}
