import os from 'os';

export const getIp = () => {
  let address;
  const ifaces = os.networkInterfaces();

  for (const dev in ifaces) {
    const iface = ifaces[dev]?.filter((details: os.NetworkInterfaceInfo) => {
      return details.family === 'IPv4' && details.internal === false;
    });

    if (iface && iface.length > 0) {
      address = iface[0].address;
    }
  }

  return address;
};
