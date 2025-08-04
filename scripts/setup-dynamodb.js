const { DynamoDBClient, CreateTableCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'cruces-gymnastics-data';

async function createTable() {
  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },  // Partition key
      { AttributeName: 'SK', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand billing
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'SK', KeyType: 'HASH' },
          { AttributeName: 'PK', KeyType: 'RANGE' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  });

  try {
    console.log('Creating DynamoDB table...');
    await client.send(command);
    console.log('✅ Table created successfully!');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('✅ Table already exists');
    } else {
      console.error('❌ Error creating table:', error);
      throw error;
    }
  }
}

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crucesgymnastics.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'TempAdmin123!';
  
  const hashedPassword = bcrypt.hashSync(adminPassword, 12);
  const timestamp = new Date().toISOString();

  const adminUser = {
    PK: `USER#${adminEmail}`,
    SK: `PROFILE#${adminEmail}`,
    email: adminEmail,
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isActive: true,
    createdAt: timestamp,
    passwordHash: hashedPassword,
  };

  try {
    console.log('Creating admin user...');
    await docClient.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: adminUser,
    }));
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Remember to change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createSampleClasses() {
  const classes = [
    {
      PK: 'CLASS#preschool_1',
      SK: 'CLASS#preschool_1',
      id: 'preschool_1',
      name: 'Pre-School Gymnastics',
      programType: 'preschool',
      dayOfWeek: 'monday',
      startTime: '10:00',
      endTime: '11:00',
      capacity: 8,
      ageMin: 3,
      ageMax: 5,
      skillLevel: 'beginner',
      monthlyPrice: 85,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      PK: 'CLASS#boys_rec_1',
      SK: 'CLASS#boys_rec_1',
      id: 'boys_rec_1',
      name: 'Boys Recreational Gymnastics',
      programType: 'boys_recreational',
      dayOfWeek: 'tuesday',
      startTime: '16:00',
      endTime: '17:30',
      capacity: 12,
      ageMin: 6,
      ageMax: 12,
      skillLevel: 'beginner',
      monthlyPrice: 95,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      PK: 'CLASS#girls_rec_1',
      SK: 'CLASS#girls_rec_1',
      id: 'girls_rec_1',
      name: 'Girls Recreational Gymnastics',
      programType: 'girls_recreational',
      dayOfWeek: 'wednesday',
      startTime: '16:00',
      endTime: '17:30',
      capacity: 12,
      ageMin: 6,
      ageMax: 12,
      skillLevel: 'beginner',
      monthlyPrice: 95,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    console.log('Creating sample classes...');
    for (const classItem of classes) {
      await docClient.send(new PutItemCommand({
        TableName: TABLE_NAME,
        Item: classItem,
      }));
    }
    console.log('✅ Sample classes created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample classes:', error);
    throw error;
  }
}

async function setupDynamoDB() {
  try {
    console.log('🚀 Setting up DynamoDB for Cruces Gymnastics Center...\n');
    
    await createTable();
    await createAdminUser();
    await createSampleClasses();
    
    console.log('\n🎉 DynamoDB setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your environment variables with AWS credentials');
    console.log('2. Test the application locally');
    console.log('3. Deploy to Amplify');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDynamoDB();
}

module.exports = { setupDynamoDB }; 