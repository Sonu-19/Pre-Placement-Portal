const clients = new Map(); // userId -> Set of response objects

function addClient(userId, res) {
  if (!clients.has(String(userId))) clients.set(String(userId), new Set());
  clients.get(String(userId)).add(res);
}

function removeClient(userId, res) {
  const set = clients.get(String(userId));
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(String(userId));
}

function sendEventToUser(userId, eventName, data) {
  const set = clients.get(String(userId));
  if (!set) return 0;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  for (const res of set) {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // ignore write errors; client will close and be removed on 'close'
    }
  }
  return set.size;
}

export { addClient, removeClient, sendEventToUser };
