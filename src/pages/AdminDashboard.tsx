import { useState, useEffect } from 'react';
import { Users, Settings, CheckCircle, Clock, XCircle, Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, ShoppingCart, Package, Tag } from 'lucide-react';
import { Product } from '../types';
import { KYCReviewCard } from '../components/admin/KYCReviewCard';
import { InterestRateConfig } from '../components/admin/InterestRateConfig';
import adminApi, { KYCApplication, InstallmentPlan, AdminUser, AdminOrder } from '../api/admin.api';
import { bannersApi, Banner } from '../api/banners.api';
import { productsApi } from '../api/products.api';

import type { InstallmentPlanConfig } from '../types';

type TabType = 'kyc' | 'rates' | 'banners' | 'users' | 'orders' | 'products' | 'categories';

interface AdminDashboardProps {
  onNavigate?: (page: 'home' | 'admin' | 'banners') => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('kyc');
  const [applications, setApplications] = useState<any[]>([]);
  const [plans, setPlans] = useState<InstallmentPlanConfig[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoadingKYC, setIsLoadingKYC] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  // Users & Orders State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);


  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1 });

  const [orderPagination, setOrderPagination] = useState({ page: 1, totalPages: 1 });

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'customer',
    governorate: '',
    isVerified: false,
  });

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [existingProductImages, setExistingProductImages] = useState<string[]>([]);

  // Banner management state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    bgGradient: 'from-[#003366] to-[#004488]',
    isActive: true,
    sortOrder: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Category Management State
  const [managementCategories, setManagementCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });

  // Fetch Categories for Management Tab
  useEffect(() => {
    if (activeTab === 'categories') {
      const fetchCats = async () => {
        setIsLoadingCategories(true);
        try {
          const res = await productsApi.getCategories();
          setManagementCategories(res.data || []);
        } catch (err) {
          console.error('Error fetching categories:', err);
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCats();
    }
  }, [activeTab]);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, categoryForm);
      } else {
        await adminApi.createCategory(categoryForm);
      }
      // Refresh
      const res = await productsApi.getCategories();
      setManagementCategories(res.data || []);
      setCategoriesList((res.data || []).map((c: any) => c.name)); // Update dropdowns too
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '' });
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure? This might affect products in this category.')) return;
    try {
      await adminApi.deleteCategory(id);
      setManagementCategories(prev => prev.filter(c => c.id !== id));
      // Update dropdowns
      setCategoriesList(prev => {
        const cat = managementCategories.find(c => c.id === id);
        return prev.filter(name => name !== cat?.name);
      });
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Fetch KYC applications on mount
  useEffect(() => {
    const fetchKYCApplications = async () => {
      try {
        setIsLoadingKYC(true);
        const response = await adminApi.getPendingKYC();

        // Map API response to format expected by KYCReviewCard
        const mappedProfiles = (response.data.profiles || []).map((profile: any) => ({
          ...profile,
          userName: profile.user?.fullName || 'Unknown User',
          userPhone: profile.user?.phoneNumber || 'N/A',
          scannedIdUrl: profile.nationalIdImageUrl || '',
          utilityBillUrl: profile.utilityBillImageUrl || '',
          monthlySalary: profile.monthlyIncome || 0,
          employer: profile.employmentStatus || 'Unknown',
          address: profile.user?.governorate || 'Unknown',
        }));

        setApplications(mappedProfiles);
      } catch (err: any) {
        console.error('Failed to fetch KYC applications:', err);
        setError('KYC service unavailable. Other admin features (Banner Management, Interest Rates) still work.');
      } finally {
        setIsLoadingKYC(false);
      }
    };

    fetchKYCApplications();
  }, []);

  // Fetch installment plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const response = await adminApi.getInstallmentPlans();
        setPlans(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch installment plans:', err);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();

    // Fetch categories for dropdown
    productsApi.getCategories().then(res => {
      setCategoriesList(res.data.map(c => c.name));
    }).catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Fetch products when tab active
  useEffect(() => {
    if (activeTab === 'products') {
      setIsLoadingProducts(true);
      productsApi.getProducts({ limit: 50 }) // Higher limit for admin
        .then(res => setProducts(res.data.products))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingProducts(false));
    }
  }, [activeTab]);

  const handleApprove = async (userId: string, creditLimit: number) => {
    try {
      // Call backend API
      await adminApi.approveKYC(userId, creditLimit);

      // Update local state on success
      setApplications((prev) =>
        prev.map((app) =>
          app.userId === userId
            ? {
              ...app,
              kycStatus: 'Approved' as const,
              kycApprovedAt: new Date(),
              approvedBy: 'admin-current',
            }
            : app
        )
      );
      console.log(`Approved ${userId} with credit limit: ${creditLimit} EGP`);
    } catch (error: any) {
      console.error('Failed to approve KYC:', error);
      alert(`Failed to approve KYC: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      // Call backend API
      await adminApi.rejectKYC(userId, reason);

      // Update local state on success
      setApplications((prev) =>
        prev.map((app) =>
          app.userId === userId ? { ...app, kycStatus: 'Rejected' as const } : app
        )
      );
      console.log(`Rejected ${userId} - Reason: ${reason}`);
    } catch (error: any) {
      console.error('Failed to reject KYC:', error);
      alert(`Failed to reject KYC: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdatePlan = async (planId: string, updates: Partial<InstallmentPlanConfig>) => {
    try {
      await adminApi.updatePlan(planId, updates);
      setPlans((prev) =>
        prev.map((plan) => (plan.id === planId ? { ...plan, ...updates } : plan))
      );
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Failed to update plan');
    }
  };

  const handleCreatePlan = async (newPlan: Omit<InstallmentPlanConfig, 'id'>) => {
    try {
      const response = await adminApi.createPlan(newPlan);
      const createdPlan = response.data; // Assuming backend returns full plan
      // If backend returns just data, we might need to conform it. 
      // Our service returns the prisma object, so it should have ID.
      setPlans((prev) => [...prev, createdPlan]);
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Failed to create plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await adminApi.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan');
    }
  };

  // Product Handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(productForm).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'imageUrl' && value !== undefined && value !== null) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Append new images
      productImageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Append existing images for update
      if (editingProduct && existingProductImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingProductImages));
      }

      if (editingProduct) {
        const res = await productsApi.updateProduct(editingProduct.id, formData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
      } else {
        const res = await productsApi.createProduct(formData);
        setProducts(prev => [res.data, ...prev]);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({});
      setProductImageFiles([]);
      setProductImagePreviews([]);
      setExistingProductImages([]);
    } catch (error) {
      console.error('Product save failed', error);
      alert('Failed to save product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Product delete failed', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean, role: string) => {
    try {
      await adminApi.updateUser(userId, { isVerified: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update user verification');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await adminApi.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    } catch (err: any) {
      console.error(err);
      alert('Failed to update order status');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'customer',
      governorate: '',
      isVerified: false,
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName,
      email: user.email || '',
      phoneNumber: user.phoneNumber,
      password: '',
      role: user.role,
      governorate: user.governorate || '',
      isVerified: user.isVerified,
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: any = {
          role: userForm.role,
          isVerified: userForm.isVerified,
          governorate: userForm.governorate,
          fullName: userForm.fullName,
          phoneNumber: userForm.phoneNumber,
          email: userForm.email,
        };
        await adminApi.updateUser(editingUser.id, updateData);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
      } else {
        const res = await adminApi.createUser(userForm);
        setUsers(prev => [res.data, ...prev]);
      }
      setShowUserModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  // Banner management functions
  const fetchBanners = async () => {
    if (activeTab === 'banners' && banners.length === 0) {
      try {
        setIsLoadingBanners(true);
        const data = await bannersApi.getAllBanners();
        setBanners(data);
      } catch (error: any) {
        console.error('Failed to fetch banners:', error);
        // If it's a 404, it might just mean no banners exist yet, which is fine
        if (error.response && error.response.status === 404) {
          setBanners([]);
        }
        // Don't show alert for default fetch errors to avoid annoying the user
        // alert('Failed to load banners');
      } finally {
        setIsLoadingBanners(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'banners') {
      fetchBanners();
    }

    // Fetch Users
    if (activeTab === 'users' && users.length === 0) {
      setIsLoadingUsers(true);
      adminApi.getAllUsers()
        .then(data => {
          setUsers(data.users);
          setUserPagination(prev => ({ ...prev, totalPages: data.pagination.totalPages }));
        })
        .catch(err => console.error('Failed to fetch users', err))
        .finally(() => setIsLoadingUsers(false));
    }

    // Fetch Orders
    if (activeTab === 'orders' && orders.length === 0) {
      setIsLoadingOrders(true);
      adminApi.getAllOrders()
        .then(data => {
          setOrders(data.orders);
          setOrderPagination(prev => ({ ...prev, totalPages: data.pagination.totalPages }));
        })
        .catch(err => console.error('Failed to fetch orders', err))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [activeTab]);

  const handleOpenBannerModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink || '',
        bgGradient: banner.bgGradient,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
      });
      setImagePreview(banner.imageUrl);
    } else {
      setEditingBanner(null);
      setBannerFormData({
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        bgGradient: 'from-[#003366] to-[#004488]',
        isActive: true,
        sortOrder: banners.length,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowBannerModal(true);
  };

  const handleCloseBannerModal = () => {
    setShowBannerModal(false);
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBanner && !imageFile) {
      alert('Please upload an image');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('title', bannerFormData.title);
      formPayload.append('subtitle', bannerFormData.subtitle);
      formPayload.append('ctaText', bannerFormData.ctaText);
      formPayload.append('ctaLink', bannerFormData.ctaLink);
      formPayload.append('bgGradient', bannerFormData.bgGradient);
      formPayload.append('isActive', bannerFormData.isActive.toString());
      formPayload.append('sortOrder', bannerFormData.sortOrder.toString());

      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      if (editingBanner) {
        await bannersApi.updateBanner(editingBanner.id, formPayload);
      } else {
        await bannersApi.createBanner(formPayload);
      }

      await fetchBanners();
      handleCloseBannerModal();
      alert(editingBanner ? 'Banner updated!' : 'Banner created!');
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      await bannersApi.deleteBanner(id);
      await fetchBanners();
      alert('Banner deleted!');
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner');
    }
  };

  const toggleBannerActive = async (banner: Banner) => {
    try {
      const formPayload = new FormData();
      formPayload.append('isActive', (!banner.isActive).toString());
      await bannersApi.updateBanner(banner.id, formPayload);
      await fetchBanners();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
      alert('Failed to toggle banner status');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.kycStatus.toLowerCase() === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.kycStatus === 'Pending').length,
    approved: applications.filter((a) => a.kycStatus === 'Approved').length,
    rejected: applications.filter((a) => a.kycStatus === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-[#003366] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/80">Manage KYC applications and system settings</p>
            </div>
            <button
              onClick={() => onNavigate?.('home')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ← Back to Shop
            </button>
          </div>
        </div>

        {/* Admin Navigation Bar */}
        <nav className="border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('kyc')}
                className={`text-sm whitespace-nowrap ${activeTab === 'kyc'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                KYC Applications
              </button>
              <button
                onClick={() => setActiveTab('rates')}
                className={`text-sm whitespace-nowrap ${activeTab === 'rates'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Interest Rates
              </button>
              <button
                onClick={() => setActiveTab('banners')}
                className={`text-sm whitespace-nowrap ${activeTab === 'banners'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Banners
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`text-sm whitespace-nowrap ${activeTab === 'users'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`text-sm whitespace-nowrap ${activeTab === 'orders'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`text-sm whitespace-nowrap ${activeTab === 'products'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`text-sm whitespace-nowrap ${activeTab === 'categories'
                  ? 'text-white bg-[#FF6600] font-medium'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  } transition-colors px-3 py-2 rounded-lg`}
              >
                Categories
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#003366] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#003366]">{stats.total}</p>
                <p className="text-[#666666] text-sm">Total Applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF6600] rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF6600]">{stats.pending}</p>
                <p className="text-[#666666] text-sm">Pending Review</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#00C851] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#00C851]">{stats.approved}</p>
                <p className="text-[#666666] text-sm">Approved</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF4444] rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF4444]">{stats.rejected}</p>
                <p className="text-[#666666] text-sm">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'kyc'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              KYC Applications
              {activeTab === 'kyc' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'rates'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Interest Rates
              {activeTab === 'rates' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'products'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Package className="w-4 h-4 inline-block mr-2" />
              Products
              {activeTab === 'products' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'banners'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Banners
              {activeTab === 'banners' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'categories'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Tag className="w-4 h-4 inline-block mr-2" />
              Categories
              {activeTab === 'categories' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'users'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Users
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'orders'
                ? 'text-[#003366]'
                : 'text-[#666666] hover:text-[#003366]'
                }`}
            >
              <ShoppingCart className="w-4 h-4 inline-block mr-2" />
              Orders
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366]"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'kyc' && (
          <>
            {/* Filter */}
            <div className="mb-6 flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                    ? 'bg-[#003366] text-white'
                    : 'bg-white text-[#666666] hover:bg-[#F0F4F8]'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'pending' && stats.pending > 0 && (
                    <span className="ml-2 bg-[#FF6600] text-white px-2 py-0.5 rounded-full text-xs">
                      {stats.pending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoadingKYC && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoadingKYC && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* KYC Applications Grid */}
            {!isLoadingKYC && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApplications.map((app) => (
                  <KYCReviewCard
                    key={app.userId}
                    application={app}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}

            {!isLoadingKYC && !error && filteredApplications.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-[#666666]">No applications found</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'rates' && (
          <InterestRateConfig
            plans={plans}
            categories={categoriesList}
            onUpdatePlan={handleUpdatePlan}
            onCreatePlan={handleCreatePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {activeTab === 'categories' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-[#003366]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Category Management</h2>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', icon: '' });
                  setShowCategoryModal(true);
                }}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#FF6600]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>

            {isLoadingCategories ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8FAFC]">
                      <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Icon</th>
                      <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Name</th>
                      <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Products</th>
                      <th className="text-right py-3 px-4 border-b font-medium text-[#666666]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managementCategories.map((cat) => (
                      <tr key={cat.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? (
                            <img src={cat.icon} alt={cat.name} className="w-10 h-10 object-cover rounded-full bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#1A1A1A]">{cat.name}</td>
                        <td className="py-3 px-4 text-[#666666]">{cat.productCount || 0} items</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryForm({ name: cat.name, icon: cat.icon });
                              setShowCategoryModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                    <button onClick={() => setShowCategoryModal(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon URL (or Lucide Name)</label>
                      <input
                        value={categoryForm.icon}
                        onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="https://example.com/icon.png"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste an image URL for the icon.</p>
                    </div>
                    <button type="submit" className="w-full bg-[#003366] text-white py-3 rounded-lg hover:bg-[#002244]">
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-[#003366]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Banner Management</h2>
              </div>
              <button
                onClick={() => handleOpenBannerModal()}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#FF6600]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Banner
              </button>
            </div>

            {isLoadingBanners ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8FAFC]">
                        <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Preview</th>
                        <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Details</th>
                        <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Status</th>
                        <th className="text-left py-3 px-4 border-b font-medium text-[#666666]">Order</th>
                        <th className="text-right py-3 px-4 border-b font-medium text-[#666666]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map((banner) => (
                        <tr key={banner.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-24 h-14 object-cover rounded shadow-sm"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#1A1A1A]">{banner.title}</div>
                            <div className="text-sm text-[#666666]">{banner.subtitle}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {banner.ctaText} {banner.ctaLink ? `→ ${banner.ctaLink}` : ''}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleBannerActive(banner)}
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${banner.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {banner.isActive ? (
                                <>
                                  <Eye className="w-3 h-3" /> Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-[#666666] font-medium">{banner.sortOrder}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenBannerModal(banner)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Banner"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Banner"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {banners.length === 0 && (
                    <div className="p-12 text-center text-[#666666]">
                      No banners found. Click "Add Banner" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banner Modal */}
            {showBannerModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                      {editingBanner ? 'Edit Banner' : 'Create Banner'}
                    </h2>
                    <button onClick={handleCloseBannerModal}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle *</label>
                      <input
                        type="text"
                        value={bannerFormData.subtitle}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">CTA Text *</label>
                      <input
                        type="text"
                        value={bannerFormData.ctaText}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, ctaText: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={bannerFormData.ctaLink}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, ctaLink: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="/products"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Background Gradient</label>
                      <select
                        value={bannerFormData.bgGradient}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, bgGradient: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="from-[#003366] to-[#004488]">Blue</option>
                        <option value="from-[#FF6600] to-[#FF8833]">Orange</option>
                        <option value="from-[#1A1A1A] to-[#333333]">Dark</option>
                        <option value="from-purple-600 to-purple-800">Purple</option>
                        <option value="from-green-600 to-green-800">Green</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Sort Order</label>
                      <input
                        type="number"
                        value={bannerFormData.sortOrder}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, sortOrder: parseInt(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bannerFormData.isActive}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Active</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Banner Image {!editingBanner && '*'}
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        {imagePreview && (
                          <div className="relative inline-block mb-4 group">
                            <img src={imagePreview} alt="Preview" className="max-h-48 rounded shadow-sm" />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview('');
                                setImageFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-colors z-10"
                              title="Remove Image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">
                          <Upload className="w-5 h-5" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP (Max 2MB)</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-[#FF6600] text-white px-6 py-3 rounded-lg hover:bg-[#FF6600]/90"
                      >
                        {editingBanner ? 'Update Banner' : 'Create Banner'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseBannerModal}
                        className="px-6 py-3 border rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#003366]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">User Management</h2>
              </div>
              <button
                onClick={handleAddUser}
                className="bg-[#FF6600] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#FF6600]/90"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>
            </div>

            {isLoadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-semibold text-[#003366]">Full Name</th>
                      <th className="p-4 font-semibold text-[#003366]">Phone</th>
                      <th className="p-4 font-semibold text-[#003366]">Role</th>
                      <th className="p-4 font-semibold text-[#003366]">Verified</th>
                      <th className="p-4 font-semibold text-[#003366]">Governorate</th>
                      <th className="p-4 font-semibold text-[#003366]">Joined</th>
                      <th className="p-4 font-semibold text-[#003366]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email || '-'}</div>
                        </td>
                        <td className="p-4">{user.phoneNumber}</td>
                        <td className="p-4 capitalize">{user.role}</td>
                        <td className="p-4">
                          {user.isVerified ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Verified</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Unverified</span>
                          )}
                        </td>
                        <td className="p-4">{user.governorate || '-'}</td>
                        <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleVerify(user.id, user.isVerified, user.role)}
                              className={`px-2 py-1 rounded text-xs border ${user.isVerified ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                            >
                              {user.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                No users found.
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-8 h-8 text-[#003366]" />
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Order Management</h2>
            </div>

            {isLoadingOrders ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-semibold text-[#003366]">Order #</th>
                      <th className="p-4 font-semibold text-[#003366]">Customer</th>
                      <th className="p-4 font-semibold text-[#003366]">Date</th>
                      <th className="p-4 font-semibold text-[#003366]">Total</th>
                      <th className="p-4 font-semibold text-[#003366]">Status</th>
                      <th className="p-4 font-semibold text-[#003366]">Items</th>
                      <th className="p-4 font-semibold text-[#003366]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{order.orderNumber}</td>
                        <td className="p-4">
                          <div>{order.user?.fullName}</div>
                          <div className="text-sm text-gray-500">{order.user?.phoneNumber}</div>
                        </td>
                        <td className="p-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="p-4 font-bold">{parseFloat(order.totalAmount.toString()).toLocaleString()} EGP</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>{order.status}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                No orders found.
              </div>
            )}
          </div>
        )}
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-[#003366]" />
                <h2 className="text-2xl font-bold text-[#1A1A1A]">Product Management</h2>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({});
                  setProductImageFiles([]);
                  setProductImagePreviews([]);
                  setExistingProductImages([]);
                  setShowProductModal(true);
                }}
                className="bg-[#FF6600] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#FF6600]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {isLoadingProducts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-4 font-semibold text-[#003366]">Product</th>
                      <th className="p-4 font-semibold text-[#003366]">Category</th>
                      <th className="p-4 font-semibold text-[#003366]">Price</th>
                      <th className="p-4 font-semibold text-[#003366]">Stock</th>
                      <th className="p-4 font-semibold text-[#003366]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {product.category?.name || 'N/A'}
                        </td>
                        <td className="p-4 font-bold">{product.cashPrice.toLocaleString()} EGP</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${product.stockQty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stockQty > 0 ? `${product.stockQty} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setProductForm(product);
                                setProductImageFiles([]);
                                setProductImagePreviews([]);
                                setExistingProductImages(product.images || (product.imageUrl ? [product.imageUrl] : []));
                                setShowProductModal(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowProductModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    value={productForm.name || ''}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input
                    value={productForm.brand || ''}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input
                    value={productForm.sku || ''}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (EGP)</label>
                  <input
                    type="number"
                    value={productForm.cashPrice || ''}
                    onChange={e => setProductForm({ ...productForm, cashPrice: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockQty || ''}
                    onChange={e => setProductForm({ ...productForm, stockQty: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={productForm.category || ''}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Product Images</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    {/* Existing Images */}
                    {existingProductImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative w-24 h-24 border rounded group shadow-sm">
                        <img src={img} alt="Product" className="w-full h-full object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setExistingProductImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-colors z-10"
                          title="Delete Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* New Previews */}
                    {productImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative w-24 h-24 border rounded group shadow-sm">
                        <img src={preview} alt="New Upload" className="w-full h-full object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
                            setProductImageFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-colors z-10"
                          title="Remove Upload"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Upload Button */}
                    <label className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files);
                            setProductImageFiles(prev => [...prev, ...files]);

                            const newPreviews = files.map(file => URL.createObjectURL(file));
                            setProductImagePreviews(prev => [...prev, ...newPreviews]);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-text-secondary/60">First image will be the main product image.</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={productForm.description || ''}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2 h-24"
                  />
                </div>
                <button type="submit" className="col-span-2 bg-[#003366] text-white py-3 rounded-lg hover:bg-[#002244]">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add User'}</h2>
                <button onClick={() => setShowUserModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    value={userForm.fullName}
                    onChange={e => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    value={userForm.phoneNumber}
                    onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller</option>
                    <option value="credit_officer">Credit Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Governorate</label>
                  <input
                    value={userForm.governorate}
                    onChange={e => setUserForm({ ...userForm, governorate: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userForm.isVerified}
                    onChange={e => setUserForm({ ...userForm, isVerified: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">Verified User</label>
                </div>
                <button type="submit" className="w-full bg-[#003366] text-white py-3 rounded-lg hover:bg-[#002244]">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

