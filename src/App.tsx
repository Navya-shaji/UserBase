import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Alert
} from '@mui/material';
import { Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Dexie } from 'dexie';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
}

interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  phone: string;
  picture: { large: string };
}

interface RandomUserApiResponse {
  results: RandomUser[];
  info: {
    results: number;
    page: number;
    version: string;
    seed: string;
  };
}

// IndexedDB Setup
class UserDatabase extends Dexie {
  users!: Dexie.Table<User, string>;

  constructor() {
    super('UserDatabase');
    this.version(1).stores({
      users: 'id, firstName, lastName, email'
    });
  }
}

const db = new UserDatabase();

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Call Random User API
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://randomuser.me/api/?results=50');

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data: RandomUserApiResponse = await response.json();

      const mappedUsers: User[] = data.results.map((user) => ({
        id: user.login.uuid,
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        phone: user.phone,
        image: user.picture.large
      }));

      // Step 3: Save to IndexedDB (Clear old data and save new batch)
      console.log('Replacing users in IndexedDB with 50 new ones...');
      await db.users.clear();
      await db.users.bulkPut(mappedUsers);
      console.log('✅ Data saved to IndexedDB successfully!');

      setUsers(mappedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔍 Checking IndexedDB for existing users...');
        const storedUsers = await db.users.toArray();
        console.log('📊 Found', storedUsers.length, 'users in IndexedDB:', storedUsers);

        if (storedUsers.length > 0) {
          console.log('✅ Loading users from IndexedDB (no API call needed)');
          setUsers(storedUsers);
        } else {
          console.log('📭 No users found in IndexedDB, fetching from API...');
          fetchUsers();
        }
      } catch (err) {
        console.error('❌ Error loading from IndexedDB:', err);
        setError('Failed to load users from storage');
        fetchUsers();
      }
    };

    loadInitialData();
  }, []);

  // Step 8: Delete functionality (IndexedDB only)
  const handleDeleteUser = async (userId: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting user from IndexedDB:', userId);
      await db.users.delete(userId);
      console.log('✅ User deleted from IndexedDB successfully');

      const remainingUsers = await db.users.toArray();
      console.log('📊 Remaining users in IndexedDB:', remainingUsers.length);

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          User Directory
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5">
            Total Users: {users.length}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && users.length > 0 && (
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid
                key={user.id}
                sx={{
                  width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' },
                  p: 1
                }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.phone}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && users.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No users found. Click Refresh to load users.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
