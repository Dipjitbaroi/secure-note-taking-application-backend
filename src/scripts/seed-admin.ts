import { z } from 'zod';
import { hashPassword } from '../common/utils/password';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../modules/users/user.model';

const admin = z
  .object({
    ADMIN_NAME: z.string().default('Admin'),
    ADMIN_EMAIL: z.email().toLowerCase(),
    ADMIN_PASSWORD: z.string().min(8),
  })
  .parse(process.env);

async function run() {
  await connectDB();
  await User.init(); // make sure the unique email index exists

  const existing = await User.findOne({ email: admin.ADMIN_EMAIL }).lean();
  if (existing) {
    console.log(`Admin ${admin.ADMIN_EMAIL} already exists`);
  } else {
    await User.create({
      name: admin.ADMIN_NAME,
      email: admin.ADMIN_EMAIL,
      password: await hashPassword(admin.ADMIN_PASSWORD),
      role: 'admin',
    });
    console.log(`Admin ${admin.ADMIN_EMAIL} created`);
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});
