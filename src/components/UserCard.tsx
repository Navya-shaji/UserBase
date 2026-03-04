import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import type { User } from '../types/user';

interface UserCardProps {
  user: User;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
  const handleDelete = () => {
    onDelete(user.id);
  };

  return (
    <Card
      id={`user-card-${user.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          borderColor: '#3b82f6'
        }
      }}
    >
      <Box sx={{
        position: 'relative',
        pt: { xs: '65%', sm: '100%' }
      }}>
        <CardMedia
          component="img"
          image={user.image}
          alt={`${user.firstName} ${user.lastName}`}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s',
          '.MuiCard-root:hover &': { opacity: 1 }
        }} />
      </Box>
      <CardContent sx={{
        flexGrow: 1,
        pt: { xs: 2, sm: 3 },
        px: { xs: 2.5, sm: 3 },
        pb: { xs: 1, sm: 2 }
      }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            fontSize: { xs: '1.05rem', sm: '1.1rem' },
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {user.firstName} {user.lastName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            wordBreak: 'break-all' // avoid overflow from long emails
          }}
        >
          {user.email}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#94a3b8',
            fontSize: '0.8125rem'
          }}
        >
          {user.phone}
        </Typography>
      </CardContent>
      <CardActions sx={{
        p: { xs: 2, sm: 2 },
        pt: 0,
        pb: { xs: 2.5, sm: 2 }
      }}>
        <Button
          id={`delete-btn-${user.id}`}
          fullWidth
          size="medium"
          color="error"
          variant="outlined"
          onClick={handleDelete}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              bgcolor: '#fef2f2'
            }
          }}
        >
          Remove Profile
        </Button>
      </CardActions>
    </Card>
  );
};

export default UserCard;
