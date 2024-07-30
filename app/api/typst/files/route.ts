import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query;
  const projectPath = path.join(process.cwd(), 'documents', projectId as string);

  try {
    const files = fs.readdirSync(projectPath);
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Unable to list files' });
  }
};