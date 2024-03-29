import React, { useContext, useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import BullsAiLogo from '../images/BullsAI logo_coloured_logo.png';
import {
  Typography,
  Button,
  //Link,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  ListItemIcon,
  ListItemText,
  Box, // Added Box component for wrapping elements
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Header = () => {
  const authContext = useContext(AuthContext);
  const { userId, userName, status, setUserId, setUserName, setStatus } = authContext || {};
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true); // New state for loading status
  // eslint-disable-next-line no-unused-vars
  const [isLoggedOut, setIsLoggedOut] = useState(false); // New state for logout status
  const dropdownRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);

  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  useEffect(() => {
    const checkAuthentication = async () => {
      const storedUserId = localStorage.getItem('userId');
      const storedUserName = localStorage.getItem('userName');
      const storedStatus = localStorage.getItem('status');

      if (storedUserId && storedUserName && storedStatus) {
        setUserId(storedUserId);
        setUserName(storedUserName);
        setStatus(storedStatus);
       
              }

      // Set loading to false once authentication check is complete
      setLoading(false);
    };

    checkAuthentication();
  }, [setUserId, setUserName, setStatus]);

  useEffect(() => {
    if (!userId && !loading) {
      // Navigate to default route only if not authenticated and loading is false
      navigate('/');
      setIsLoggedOut(true); // Set logout status to true
    } else {
      setIsLoggedOut(false); // Set logout status to false
    }
  }, [userId, loading, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (!userId) {
      setDropdownVisible(false);
    } else {
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('status', status);
    }
  }, [userId, userName, status]);



  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('status');
    localStorage.removeItem('userData');

      setUserId('');
      setUserName('');
      setDropdownVisible(false);
      setStatus('');
      navigate('/');
    };
  

  // const handleDropdownOptionClick = () => {
  //   setDropdownVisible(false);
  // };

  //   if (loading || isLoggedOut) {
  //     // You can show a loading indicator or null during the initial loading phase or after logout
  //     return null;
  //   }

  const handleLogoutConfirm = () => {
    handleLogout();
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };


  return (
    <div>
        <AppBar position="static" style={{ background: 'black' }}>
            <Toolbar>
                <RouterLink to="/mainPage" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <Avatar alt="BullsAI Logo" src={BullsAiLogo} />
                    <Typography variant="body1" style={{ marginLeft: '8px', fontFamily: 'helvetica, sans-serif', fontSize: '18px' }}>BULLS AI</Typography>
                </RouterLink>
                <div style={{ flexGrow: 1 }} />
                <Box display="flex" alignItems="center">
                    <Button component={RouterLink} to="/my-ticker" color="inherit" style={{ marginRight: '10px' }}>
                        Ticker List
                    </Button>
                    <Button component={RouterLink} to="/glossary" color="inherit" style={{ marginRight: '10px' }}>
                        Glossary
                    </Button>
                    <Button component={RouterLink} to="/PricingPage" color="inherit" style={{ marginRight: '10px' }}>
                        Upgrade Plan
                    </Button>
                    {userId ? (
                        <div>
                            <IconButton onClick={handleMenu} color="inherit">
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                getContentAnchorEl={null}
                            >
                                <MenuItem component={RouterLink} to="/UserInfo" onClick={handleClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleDialogOpen}>
                                    <ListItemIcon>
                                        <AccountCircle fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </MenuItem>
                            </Menu>
                            <Dialog
                                open={openDialog}
                                onClose={handleDialogClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">{"Are you sure you want to log out?"}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        This action will log you out of your account.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleDialogClose} color="primary">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
                                        Confirm Logout
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    ) : (
                            <Button component={RouterLink} to="/login" color="inherit">
                                Login
                            </Button>
                        )}
                </Box>
            </Toolbar>
        </AppBar>
    </div>
  );

};


export default Header;

