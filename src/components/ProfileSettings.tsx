import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CURRENCIES } from '@/utils/currencies';

// Profile settings component for user data management

interface ProfileSettingsProps {
  children: React.ReactNode;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    monthly_income: profile?.monthly_income?.toString() || '',
    currency: profile?.currency || 'USD',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    try {
      const updates: Record<string, unknown> = {
        name: formData.name,
        currency: formData.currency,
      };

      // Only include monthly_income if it's a valid number
      const income = parseFloat(formData.monthly_income);
      if (!isNaN(income) && income >= 0) {
        updates.monthly_income = income;
      }

      const { error } = await updateProfile(updates);

      if (error) {
        toast.error('Failed to update profile: ' + error.message);
      } else {
        toast.success('Profile updated successfully!');
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || '',
        monthly_income: profile.monthly_income?.toString() || '',
        currency: profile.currency || 'USD',
      });
    }
  }, [isOpen, profile]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your display name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_income">Monthly Income (Optional)</Label>
            <Input
              id="monthly_income"
              type="number"
              min="0"
              step="0.01"
              value={formData.monthly_income}
              onChange={(e) => handleInputChange('monthly_income', e.target.value)}
              placeholder="Enter your monthly income"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;