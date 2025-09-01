import { storage } from './server/storage-factory';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const userData = {
      username: 'testuser',
      password: hashedPassword,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      city: 'Paris',
      language: 'fr'
    };
    
    const user = await storage.createUser(userData);
    console.log('User created:', { id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createTestUser();
