import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { db } from './services/dbService';
import UserCard from './components/UserCard';
import type { User, RandomUserApiResponse } from './types/user';



function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Step 2: Call Random User API
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setPage(1);

    // 1. Primary Attempt: randomuser.me
    try {
      console.log('Attempting primary API (randomuser.me)...');
      const response = await fetch('https://randomuser.me/api/?results=50');

      if (response.ok) {
        const data: RandomUserApiResponse = await response.json();
        if (data.results && data.results.length > 0) {
          const mappedUsers: User[] = data.results.map((user) => ({
            id: user.login.uuid,
            firstName: user.name.first,
            lastName: user.name.last,
            email: user.email,
            phone: user.phone,
            image: user.picture.large
          }));
          await db.users.clear();
          await db.users.bulkPut(mappedUsers);
          setUsers(mappedUsers);
          console.log('✅ Successfully loaded from primary API');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Primary API failed:', err);
    }

    // 2. Secondary Attempt: DummyJSON
    try {
      console.log('Attempting secondary API (dummyjson.com)...');
      const response = await fetch('https://dummyjson.com/users?limit=50');

      if (response.ok) {
        const data = await response.json();
        const mappedUsers: User[] = data.users.map((user: any) => ({
          id: `dj-${user.id}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          image: user.image
        }));
        await db.users.clear();
        await db.users.bulkPut(mappedUsers);
        setUsers(mappedUsers);
        setError('Note: Used backup user source due to connection limits.');
        console.log('✅ Successfully loaded from secondary API');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Secondary API failed:', err);
    }

    // 3. Final Fallback: Mock Data
    console.log('API access blocked or failed. Loading local 50 users...');
    setError('Network error: External sources unreachable. Showing 50 local profiles.');

    const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
      id: `mock-${i}`,
      firstName: i % 2 === 0 ? 'Alex' : 'Jordan',
      lastName: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `(555) ${100 + i}-${2000 + i}`,
      image: `https://i.pravatar.cc/300?u=mock${i}`
    }));

    try {
      await db.users.clear();
      await db.users.bulkPut(mockUsers);
    } catch (dbErr) {
      console.warn('DB Save failed:', dbErr);
    }
    setUsers(mockUsers);
    setLoading(false);
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

      setUsers(prevUsers => {
        const remaining = prevUsers.filter(user => user.id !== userId);
        // If current page is now empty, move back to previous page
        const newTotalPages = Math.ceil(remaining.length / ITEMS_PER_PAGE);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
        return remaining;
      });
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="left"
            sx={{
              fontWeight: 800,
              // Responsive font size
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '3.75rem' },
              background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              mb: 1
            }}
          >
            User Directory
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              maxWidth: '600px'
            }}
          >
            Manage and browse your team members efficiently.
          </Typography>

          <Box sx={{
            display: 'flex',
            // Stack elements on mobile
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 3, sm: 0 },
            mb: 6,
            p: { xs: 2.5, sm: 3 },
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }}>
            <Box>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#1e293b',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                {users.length > 0
                  ? `Active Members (${users.length})`
                  : 'No active members'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length > 0
                  ? `Displaying ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, users.length)}`
                  : 'Connect to API to load users'}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.2)',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgb(37 99 235 / 0.3)',
                }
              }}
            >
              Sync Directory
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
            <>
              <Grid container spacing={3}>
                {paginatedUsers.map((user) => (
                  <Grid key={user.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <UserCard user={user} onDelete={handleDeleteUser} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                    siblingCount={isMobile ? 0 : 1}
                  />
                </Box>
              )}
            </>
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
    </Box>
  );
}

export default App;
