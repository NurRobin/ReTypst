import { NextRequest } from 'next/server';
import { Server } from 'socket.io';
import { writeFile } from 'fs/promises';
import path from 'path';
import { ServerResponse } from 'http';

const io = new Server();

io.on('connection', (socket) => {
  socket.on('join-room', (fileName) => {
    socket.join(fileName);
  });

  socket.on('file-change', async (fileName, content) => {
    const filePath = path.resolve(`./documents/${fileName}.typ`);
    await writeFile(filePath, content, 'utf-8');
    io.to(fileName).emit('update-file', content);
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req: NextRequest, res: ServerResponse) => {
  if (!(res as any).socket.server.io) {
    (res as any).socket.server.io = io;
  }
  res.end();
};