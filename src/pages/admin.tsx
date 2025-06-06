// pages/admin/index.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, RotateCcw, Copy, Eye, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  qrProfile: {
    uuid: string;
    name: string | null;
    isPublished: boolean;
    qrCode: string | null;
    editUrl: string;
    viewUrl: string | null;
    mobileEditUrl: string | null;
    mobileViewUrl: string | null;
  } | null;
}

// Environment-based API URL
const API_BASE_URL = 'http://8.215.196.12:4000';

// Frontend base URL - change this to your actual frontend domain
const FRONTEND_BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}` 
  : 'http://localhost:3000'; // fallback for SSR

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const { toast } = useToast();

  // Helper functions to generate correct frontend URLs
  const getFrontendEditUrl = (uuid: string) => `${FRONTEND_BASE_URL}/edit/${uuid}`;
  const getFrontendViewUrl = (uuid: string) => `${FRONTEND_BASE_URL}/scan/${uuid}`;

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        // Generate the correct frontend URL for the toast
        const frontendEditUrl = getFrontendEditUrl(result.data.qrUuid);
        toast({
          title: "Success",
          description: `User created! Edit URL: ${frontendEditUrl}`,
        });
        setFormData({ username: '', password: '', email: '' });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        fetchUsers();
        toast({
          title: "Success",
          description: "User status updated"
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchUsers();
        toast({
          title: "Success",
          description: "User deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const regenerateQR = async (uuid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/qr/${uuid}/regenerate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchUsers();
        toast({
          title: "Success",
          description: "QR Code regenerated"
        });
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate QR code",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  const downloadQR = (qrCode: string, username: string) => {
    const link = document.createElement('a');
    link.download = `qr-${username}.png`;
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline">Total Users: {users.length}</Badge>
      </div>
      
      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found. Create your first user above.
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                    </div>
                  </div>
                  
                  {user.qrProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Profile: {user.qrProfile.name || user.username}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.qrProfile.isPublished ? 'default' : 'outline'} className="text-xs">
                            {user.qrProfile.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        
                        {/* URLs - Using frontend URLs instead of API URLs */}
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(getFrontendEditUrl(user.qrProfile!.uuid))}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Edit URL
                            </Button>
                            {user.qrProfile.isPublished && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(getFrontendViewUrl(user.qrProfile!.uuid))}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View URL
                              </Button>
                            )}
                          </div>
                          
                          {/* Mobile URLs if available - these come from the backend */}
                          {(user.qrProfile.mobileEditUrl || user.qrProfile.mobileViewUrl) && (
                            <div className="flex gap-2">
                              {user.qrProfile.mobileEditUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(user.qrProfile!.mobileEditUrl!)}
                                >
                                  📱 Edit
                                </Button>
                              )}
                              {user.qrProfile.mobileViewUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(user.qrProfile!.mobileViewUrl!)}
                                >
                                  📱 View
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Display URLs for reference */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Edit: {getFrontendEditUrl(user.qrProfile.uuid)}</div>
                          {user.qrProfile.isPublished && (
                            <div>View: {getFrontendViewUrl(user.qrProfile.uuid)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        {user.qrProfile.qrCode && (
                          <img
                            src={user.qrProfile.qrCode}
                            alt="QR Code"
                            className="w-24 h-24 border rounded cursor-pointer hover:opacity-80"
                            onClick={() => downloadQR(user.qrProfile!.qrCode!, user.username)}
                            title="Click to download QR code"
                          />
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => regenerateQR(user.qrProfile!.uuid)}
                            title="Regenerate QR Code"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                          {user.qrProfile.qrCode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadQR(user.qrProfile!.qrCode!, user.username)}
                              title="Download QR Code"
                            >
                              <QrCode className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}