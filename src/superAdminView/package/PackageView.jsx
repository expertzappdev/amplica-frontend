import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, IconButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewHeader from '../../uiComponent/viewheader';
import PackageTable from './PackageTable';
import AddPackageDrawer from '../../components/addPackage/AddPackageDrawer';
import PackageDetailModal from './packageDetail/PackageDetailModal';
import ErrorBoundary from '../../uiComponent/errorboundary/ErrorBoundary';
import { gridSpacing } from '../../store/constant';
import toast from 'react-hot-toast';
import Can from '../../uiComponent/Can';

// Redux imports
import {
  fetchPackagesRequest,
  createPackageRequest,
  updatePackageRequest,
  deletePackageRequest,
  clearPackagesError,
  clearEditingPackageState,
  selectAllPackages,
  selectPackagesLoading,
  selectPackagesError,
  selectPackageData,
  selectIsDeletingPackage
} from '../../redux/features/package/packageSlice';

import {
  fetchModulesRequest,
  selectAllModules
} from '../../redux/features/module/moduleSlice';

export default function PackageView() {
  const dispatch = useDispatch();
  
  // Redux selectors
  const packagesData = useSelector(selectAllPackages);
  const packagesLoading = useSelector(selectPackagesLoading);
  const packageError = useSelector(selectPackagesError);
  const editingPackageData = useSelector(selectPackageData);
  const isDeletingPackage = useSelector(selectIsDeletingPackage);
  const modulesData = useSelector(selectAllModules);
  
  // Local state
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [isAddPackageDrawerOpen, setAddPackageDrawerOpen] = useState(false);
  const [isPackageDetailModalOpen, setPackageDetailModalOpen] = useState(false);
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState(null);

  // Transform packages data with serial numbers - handle both array and object with items
  const transformedPackages = useMemo(() => {
    const packagesArray = Array.isArray(packagesData) ? packagesData : (packagesData?.items || []);
    return packagesArray.map((pkg, index) => ({
      id: pkg.packageId,
      serialNumber: index + 1, // Add serial number
      packageId: pkg.packageId,
      packageName: pkg.packageName,
      description: pkg.description,
      price: pkg.price,
      isActive: pkg.isActive,
      isDeleted: pkg.isDeleted,
      modules: pkg.modules || [],
      moduleCount: pkg.modules ? pkg.modules.filter(m => m.isIncluded).length : 0,
      totalModules: pkg.modules ? pkg.modules.length : 0,
      createdAt: pkg.createdAt,
      createdBy: pkg.createdBy,
      createdByName: pkg.createdByName,
      updatedAt: pkg.updatedAt,
      updatedBy: pkg.updatedBy,
      updatedByName: pkg.updatedByName
    }));
  }, [packagesData]);

  // Transform modules data - handle both array and object with items
  const transformedModules = useMemo(() => {
    const modulesArray = Array.isArray(modulesData) ? modulesData : (modulesData?.items || []);
    return modulesArray;
  }, [modulesData]);

  // Initial data fetch
  useEffect(() => {
    if (!hasFetchedInitial) {
      dispatch(fetchPackagesRequest());
      dispatch(fetchModulesRequest());
      setHasFetchedInitial(true);
    }
  }, [dispatch, hasFetchedInitial]);

  // Toggle handlers
  const toggleAddPackageDrawer = (open) => () => {
    setAddPackageDrawerOpen(open);
    if (!open) {
      dispatch(clearEditingPackageState());
    }
  };

  // CRUD operations
  const handleCreatePackage = useCallback((packageData) => {
    dispatch(createPackageRequest({
      packageData,
      onSuccess: () => {
        setAddPackageDrawerOpen(false);
        toast.success('Package created successfully!');
      },
      onFailure: (error) => {
        toast.error(`Failed to create package: ${error}`);
      }
    }));
  }, [dispatch]);

  const handleEditPackage = useCallback((pkg) => {
    // Find the original package data to edit
    const packagesArray = Array.isArray(packagesData) ? packagesData : (packagesData?.items || []);
    const originalPackage = packagesArray.find(p => p.packageId === pkg.id);
    if (originalPackage) {
      // Set the editing package data in Redux
      dispatch({ type: 'packages/getPackageByIdSuccess', payload: originalPackage });
      setAddPackageDrawerOpen(true);
    }
  }, [dispatch, packagesData]);

  const handleUpdatePackage = useCallback((updateData) => {
    dispatch(updatePackageRequest({
      packageId: updateData.packageId,
      packageData: updateData.packageData,
      onSuccess: () => {
        setAddPackageDrawerOpen(false);
        dispatch(clearEditingPackageState());
        toast.success('Package updated successfully!');
      },
      onFailure: (error) => {
        toast.error(`Failed to update package: ${error}`);
      }
    }));
  }, [dispatch]);

  const handleDeletePackage = useCallback((packageId) => {
    dispatch(deletePackageRequest({
      packageId,
      onSuccess: () => {
        toast.success('Package deleted successfully!');
      },
      onFailure: (error) => {
        toast.error(`Failed to delete package: ${error}`);
      }
    }));
  }, [dispatch]);

  const handlePackageClick = useCallback((pkg) => {
    const packagesArray = Array.isArray(packagesData) ? packagesData : (packagesData?.items || []);
    const originalPackage = packagesArray.find(p => p.packageId === pkg.id);
    setSelectedPackageForDetail(originalPackage);
    setPackageDetailModalOpen(true);
  }, [packagesData]);

  const handleClosePackageDetailModal = () => {
    setPackageDetailModalOpen(false);
    setSelectedPackageForDetail(null);
  };

  const handleRetry = () => {
    dispatch(clearPackagesError());
    setHasFetchedInitial(false);
  };

  // Loading state
  const shouldShowFullScreenLoader = packagesLoading && !hasFetchedInitial;

  // Header actions
  const renderHeaderActions = () => (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={toggleAddPackageDrawer(true)}
      sx={{ borderRadius: '8px', height: '36.5px', whiteSpace: 'nowrap' }}
    >
      Add Package
    </Button>
  );

  // Render current view
  const renderCurrentView = () => {
    if (shouldShowFullScreenLoader) {
      return (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 200px)'
        }}>
          <CircularProgress />
        </Box>
      );
    }

    if (packageError) {
      return (
        <ErrorBoundary
          error={packageError}
          onRetry={handleRetry}
          onDismiss={() => dispatch(clearPackagesError())}
          title="Error Loading Packages"
          showInline={false}
          showImage={true}
        />
      );
    }

    return (
      <PackageTable
        packages={transformedPackages}
        isLoading={packagesLoading}
        isDeletingPackage={isDeletingPackage}
        onPackageClick={handlePackageClick}
        onEditPackage={handleEditPackage}
        onDeletePackage={handleDeletePackage}
        onUpdatePackage={handleUpdatePackage}
      />
    );
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <ViewHeader title="Package Management">
        {/* <Can perform="package:create"> */}
        {renderHeaderActions()}
        {/* </Can> */}
      </ViewHeader>

      <Box sx={{ mt: gridSpacing }}>
        {renderCurrentView()}
      </Box>

      <AddPackageDrawer
        open={isAddPackageDrawerOpen}
        onClose={toggleAddPackageDrawer(false)}
        onSubmitCreate={handleCreatePackage}
        onSubmitUpdate={handleUpdatePackage}
        editingPackage={editingPackageData}
        availableModules={transformedModules}
      />

      {selectedPackageForDetail && (
        <PackageDetailModal
          open={isPackageDetailModalOpen}
          onClose={handleClosePackageDetailModal}
          package={selectedPackageForDetail}
          onUpdatePackage={handleUpdatePackage}
        />
      )}
    </Box>
  );
}
