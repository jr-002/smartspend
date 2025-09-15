import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Download, Trash2, Shield, AlertTriangle, FileText, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gdprManager } from '@/lib/gdpr-compliance';
import { backupManager } from '@/lib/database-backup';

const DataManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    if (!user?.id) return;
    
    setIsExporting(true);
    try {
      await gdprManager.exportUserData(user.id);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    const expectedCode = `DELETE-${user.id.slice(-6).toUpperCase()}`;
    if (deleteConfirmation !== expectedCode) {
      return;
    }

    setIsDeleting(true);
    try {
      await gdprManager.deleteUserData(user.id, deleteConfirmation);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBackupData = async () => {
    if (!user?.id) return;
    
    try {
      await backupManager.exportUserData(user.id);
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  const expectedDeleteCode = `DELETE-${user.id.slice(-6).toUpperCase()}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your personal data and privacy settings
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Data Export */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Your Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Download all your financial data in JSON format (GDPR Article 20 - Right to Data Portability)
            </p>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Data Backup */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Backup Your Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a backup of your financial data for safekeeping
            </p>
            <Button 
              onClick={handleBackupData}
              variant="outline"
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              Create Backup
            </Button>
          </div>

          {/* Privacy Policy */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Privacy Information
            </h3>
            <p className="text-sm text-muted-foreground">
              Review how we handle your personal data
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  View Privacy Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {gdprManager.getPrivacyPolicyContent()}
                  </pre>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Account Deletion */}
          <div className="space-y-3 pt-6 border-t border-destructive/20">
            <h3 className="font-medium flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </h3>
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action is permanent and cannot be undone. 
                All your financial data will be permanently deleted.
              </AlertDescription>
            </Alert>
            
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All your data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Before deletion, we'll automatically export your data for your records.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirmation">
                      Type <code className="bg-muted px-1 rounded">{expectedDeleteCode}</code> to confirm:
                    </Label>
                    <Input
                      id="deleteConfirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={expectedDeleteCode}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== expectedDeleteCode || isDeleting}
                      className="flex-1"
                    >
                      {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementPanel;