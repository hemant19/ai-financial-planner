import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  type SelectChangeEvent,
  Avatar, // Added Avatar import
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShowChart as GraphIcon,
  Public as GlobeIcon,
  AccountBalance as BankIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { SelectionProvider, useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';
import { useAuth } from '../context/AuthContext';
import { Member } from '../types';

const drawerWidth = 240;

interface Props {
  window?: () => Window;
}

function LayoutContent(props: Props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedMemberId, setSelectedMemberId } = useSelection();
  const { logout, currentUser } = useAuth(); // Destructure currentUser
  const [members, setMembers] = React.useState<Member[]>([]);

  React.useEffect(() => {
    const fetchMembers = async () => {
      const data = await DataService.getMembers();
      setMembers(data);
    };
    fetchMembers();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMemberChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedMemberId(value === '' ? null : value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Indian Equities', icon: <GraphIcon />, path: '/indian-equities' },
    { text: 'Indian Mutual Funds', icon: <GraphIcon />, path: '/indian-mutual-funds' },
    { text: 'US Stocks', icon: <GlobeIcon />, path: '/us-stocks' },
    { text: 'Fixed Deposits', icon: <BankIcon />, path: '/fixed-deposits' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          FinPlan
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AI Financial Planner
          </Typography>
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Avatar sx={{ mr: 1 }}>
                {currentUser.displayName ? currentUser.displayName.charAt(0) : (currentUser.email ? currentUser.email.charAt(0) : '')}
              </Avatar>
              <Typography variant="subtitle1" color="inherit" sx={{ display: { xs: 'none', md: 'block' } }}>
                {currentUser.displayName || currentUser.email}
              </Typography>
            </Box>
          )}
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
              value={selectedMemberId || ''}
              onChange={handleMemberChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Select Member' }}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root': { color: 'white' } }}
            >
              <MenuItem value="">
                <em>Family</em>
              </MenuItem>
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default function AppLayout(props: Props) {
  return (
    <SelectionProvider>
      <LayoutContent {...props} />
    </SelectionProvider>
  );
}
