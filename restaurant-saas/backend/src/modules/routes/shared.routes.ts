import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env';
import { validate } from '../../middleware/validate';
import { ok } from '../../utils/responses';
import { getVersion } from '../health/health.controller';
import { MenuItem } from '../menu/menu.model';
import { RestaurantModel } from '../restaurants/restaurants.model';

export const sharedRouter = Router();

const uploadBodySchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  text: z.string().max(100_000).optional(),
  contentBase64: z.string().max(1_000_000).optional(),
  mimeType: z.string().trim().min(1).max(100).optional(),
});

sharedRouter.post('/uploads', validate({ body: uploadBodySchema }), async (req, res, next) => {
  try {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_PATH);
    await fs.mkdir(uploadDir, { recursive: true });

    const originalFileName = path.basename(req.body.fileName);
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFileName = `${Date.now()}-${sanitizedFileName}`;
    const targetPath = path.join(uploadDir, storedFileName);
    const fileBuffer = req.body.contentBase64
      ? Buffer.from(req.body.contentBase64, 'base64')
      : Buffer.from(req.body.text ?? `Uploaded via API on ${new Date().toISOString()}\n`, 'utf8');

    await fs.writeFile(targetPath, fileBuffer);

    ok(
      res,
      {
        upload: {
          id: `upload_${Date.now()}`,
          fileName: storedFileName,
          originalFileName,
          url: `/${env.UPLOAD_PATH}/${storedFileName}`,
          sizeBytes: fileBuffer.length,
          mimeType: req.body.mimeType ?? 'application/octet-stream',
          provider: env.UPLOAD_PROVIDER,
        },
      },
      201,
    );
  } catch (error) {
    next(error);
  }
});

sharedRouter.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim();

    const [menuItems, restaurants] = await Promise.all([
      MenuItem.find({ name: { $regex: query, $options: 'i' } })
        .select('name price isVeg isAvailable')
        .limit(10),
      RestaurantModel.find({ name: { $regex: query, $options: 'i' } })
        .select('name slug city cuisine status')
        .limit(10),
    ]);

    ok(res, { query, menuItems, restaurants });
  } catch (error) {
    next(error);
  }
});

sharedRouter.get('/version', getVersion);
