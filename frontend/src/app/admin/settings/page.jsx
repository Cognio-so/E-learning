'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Save, Eye, EyeOff, User, Mail, Lock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/store/useAuthStore';

export default function SettingsPage() {
    const { user, updateProfile, uploadProfilePicture, isLoading } = useAuthStore();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large", {
                description: "Please select an image smaller than 5MB",
                variant: "destructive"
            });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type", {  
                description: "Please select an image file",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadProfilePicture(file);
            
            // Update profile with new picture URL
            await updateProfile({ profilePicture: response.profilePicture });
            
            toast.success("Profile picture updated successfully", {
                title: "Success",
                description: "Profile picture updated successfully",
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Upload failed", {
                title: "Upload failed",
                description: error.response?.data?.message || "Failed to upload profile picture",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords if changing
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error("Password mismatch", {
                    title: "Password mismatch",
                    description: "New password and confirm password do not match",
                    variant: "destructive"
                });
                return;
            }
        }

        try {
            const updateData = {
                name: formData.name,
                email: formData.email
            };

            // Only include password fields if new password is provided
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            await updateProfile(updateData);
            
            toast.success("Profile updated successfully", {
                title: "Success",
                description: "Profile updated successfully",
            });

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            console.error('Update error:', error);
            toast.error("Update failed", {
                title: "Update failed",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive"
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Picture Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Profile Picture
                        </CardTitle>
                        <CardDescription>
                            Upload a profile picture to personalize your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage 
                                    src={user?.profilePicture} 
                                    alt={user?.name}
                                />
                                <AvatarFallback className="text-lg">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Camera className="h-4 w-4" />
                                    {isUploading ? 'Uploading...' : 'Change Picture'}
                                </Button>
                                <p className="text-sm text-gray-500">
                                    JPG, PNG or GIF. Max size 5MB.
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                        />
                    </CardContent>
                </Card>

                {/* Profile Information Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Leave blank to keep current password
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            placeholder="Enter current password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showPasswords.new ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter new password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm new password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Role</Label>
                                <p className="text-sm capitalize">{user?.role}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Grade</Label>
                                <p className="text-sm">{user?.grade}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
                                <p className="text-sm">
                                    {user?.isVerified ? (
                                        <span className="text-green-600">✓ Verified</span>
                                    ) : (
                                        <span className="text-red-600">✗ Not Verified</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                                <p className="text-sm">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
