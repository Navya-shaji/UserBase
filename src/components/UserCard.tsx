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
import type { User } from '../types';

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
      sx={{ 
        maxWidth: 345, 
        m: 2, 
        boxShadow: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={user.picture.large}
        alt={`${user.name.first} ${user.name.last}`}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div"
            sx={{ fontWeight: 'bold', textAlign: 'center' }}
          >
            {`${user.name.title}. ${user.name.first} ${user.name.last}`}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 1 }}
          >
            {user.email}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            {user.phone}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          size="small" 
          color="error" 
          variant="contained"
          onClick={handleDelete}
          sx={{ minWidth: 100 }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default UserCard;
