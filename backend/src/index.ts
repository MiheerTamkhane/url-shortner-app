import 'dotenv/config';
import app from './app';
import { ensureDummyUser } from './seed/dummyUser';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await ensureDummyUser();
  } catch (error) {
    console.error('Failed to seed dummy user:', error);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();
