import React, { useState, useEffect } from 'react';
import {
  Box, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Package,
  Search, Edit2, Save, X, Download, Eye, Filter, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface MarketplaceListing {
  channelId: string;
  channelName: string;
  externalId: string;
  isActive: boolean;
  price: number;
  lastSyncedAt: string | null;
  syncStatus: 'success' | 'error' | 'pending' | null;
  syncError: string | null;
}

interface ProductInventory {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  price: number;
  brand?: string;
  category?: string;
  images?: string[];
  warranty?: string;
  rating?: number;
  channels: MarketplaceListing[];
}

interface SyncStatusByChannel {
  [channelName: string]: {
    total: number;
    success: number;
    error: number;
    pending: number;
    lastSynced: string | null;
  };
}

interface EditingProduct {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  oldPrice?: number;
  totalStock: number;
  brand?: string;
  category?: string;
  warranty?: string;
  rating?: number;
  specs?: Record<string, string>;
}

export const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductInventory[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatusByChannel>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Edit mode states
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);

  // Detail view state
  const [viewingProduct, setViewingProduct] = useState<ProductInventory | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch all products inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE_URL}/api/marketplace/inventory`, {
        headers,
      });

      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch inventory';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Please log in as admin to view inventory');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/marketplace/sync-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSyncStatus(response.data.data);
    } catch (err: any) {
      console.error('Error fetching sync status:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchSyncStatus();

    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Channel filter
    if (filterChannel !== 'all') {
      filtered = filtered.filter((p) =>
        p.channels.some((c) => c.channelName === filterChannel)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) =>
        p.channels.some((c) => c.syncStatus === filterStatus)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterChannel, filterStatus, products]);

  // Sync product to all channels
  const syncProductToAllChannels = async (productId: string) => {
    try {
      setSyncing({ ...syncing, [productId]: true });
      setError(null);

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/marketplace/sync/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Product synced successfully to all channels');
      setTimeout(() => setSuccess(null), 3000);

      await fetchInventory();
      await fetchSyncStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync product');
    } finally {
      setSyncing({ ...syncing, [productId]: false });
    }
  };

  // Start editing a product
  const startEditing = (product: ProductInventory) => {
    setEditingProduct({
      productId: product.productId,
      productName: product.productName,
      sku: product.sku,
      price: product.cashPrice,
      oldPrice: undefined,
      totalStock: product.totalStock,
      brand: product.brand,
      category: product.category,
      warranty: product.warranty,
      rating: product.rating,
      specs: {},
    });
  };

  // Save edited product
  const saveProduct = async () => {
    if (!editingProduct) return;

    try {
      setError(null);
      const token = localStorage.getItem('token');

      const updateData: any = {
        name: editingProduct.productName,
        sku: editingProduct.sku,
        cashPrice: editingProduct.price,
        stockQty: editingProduct.totalStock,
        brand: editingProduct.brand,
      };

      // Only include optional fields if they have values
      if (editingProduct.oldPrice) updateData.oldPrice = editingProduct.oldPrice;
      if (editingProduct.warranty) updateData.warranty = editingProduct.warranty;
      if (editingProduct.rating) updateData.rating = editingProduct.rating;
      if (editingProduct.specs && Object.keys(editingProduct.specs).length > 0) {
        updateData.specs = editingProduct.specs;
      }

      await axios.put(
        `${API_BASE_URL}/api/products/${editingProduct.productId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Product updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setEditingProduct(null);
      await fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredProducts.map((product) => ({
      SKU: product.sku,
      'Product Name': product.productName,
      Brand: product.brand || 'N/A',
      Price: `EGP ${product.cashPrice}`,
      Stock: product.totalStock,
      'Amazon Status': product.channels.find(c => c.channelName === 'Amazon Egypt')?.isActive ? 'Active' : 'Inactive',
      'Noon Status': product.channels.find(c => c.channelName === 'Noon')?.isActive ? 'Active' : 'Inactive',
      'Instagram Status': product.channels.find(c => c.channelName === 'Instagram Shopping')?.isActive ? 'Active' : 'Inactive',
      Rating: product.rating || 'N/A',
      Warranty: product.warranty || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    // Auto-size columns
    const maxWidth = 50;
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.min(
        maxWidth,
        Math.max(
          key.length,
          ...exportData.map((row: any) => String(row[key] || '').length)
        )
      ),
    }));
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `SaberStore_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);

    setSuccess('Inventory exported to Excel successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Get sync status icon
  const getSyncStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#003366]">Multi-Channel Inventory</h2>
            <p className="text-gray-600 mt-1">Manage inventory across SaberStore, Amazon, Noon, and Instagram</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
            <button
              onClick={() => {
                fetchInventory();
                fetchSyncStatus();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF6600]/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
            />
          </div>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
          >
            <option value="all">All Channels</option>
            <option value="Amazon Egypt">Amazon Egypt</option>
            <option value="Noon">Noon</option>
            <option value="Instagram Shopping">Instagram Shopping</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}
      </div>

      {/* Sync Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(syncStatus).map(([channelName, stats]) => (
          <div key={channelName} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#003366]">{channelName}</h3>
              <Package className="w-5 h-5 text-[#FF6600]" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Success:</span>
                <span className="font-medium">{stats.success}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Errors:</span>
                <span className="font-medium">{stats.error}</span>
              </div>
              {stats.lastSynced && (
                <div className="text-xs text-gray-500 mt-2">
                  Last sync: {formatDate(stats.lastSynced)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amazon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Noon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instagram
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const amazonListing = product.channels.find(c => c.channelName === 'Amazon Egypt');
                const noonListing = product.channels.find(c => c.channelName === 'Noon');
                const instagramListing = product.channels.find(c => c.channelName === 'Instagram Shopping');
                const isEditing = editingProduct?.productId === product.productId;

                return (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.productName}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        <div className="text-sm text-gray-500">EGP {product.cashPrice}</div>
                        {product.brand && (
                          <div className="text-xs text-gray-400">{product.brand}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{product.totalStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {amazonListing ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSyncStatusIcon(amazonListing.syncStatus)}
                            <span className="text-sm">{amazonListing.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(amazonListing.lastSyncedAt)}
                          </div>
                          {amazonListing.syncError && (
                            <div className="text-xs text-red-600">{amazonListing.syncError}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not listed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {noonListing ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSyncStatusIcon(noonListing.syncStatus)}
                            <span className="text-sm">{noonListing.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(noonListing.lastSyncedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not listed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {instagramListing ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSyncStatusIcon(instagramListing.syncStatus)}
                            <span className="text-sm">{instagramListing.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(instagramListing.lastSyncedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not listed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#003366] text-white text-sm rounded-lg hover:bg-[#003366]/90"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => startEditing(product)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => syncProductToAllChannels(product.productId)}
                          disabled={syncing[product.productId]}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6600] text-white text-sm rounded-lg hover:bg-[#FF6600]/90 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing[product.productId] ? 'animate-spin' : ''}`} />
                          Sync
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No products found</p>
            {searchTerm && <p className="text-sm mt-2">Try adjusting your search or filters</p>}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#003366]">Product Details</h3>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Images */}
              {viewingProduct.images && viewingProduct.images.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-[#003366] mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Product Images
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {viewingProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${viewingProduct.productName} ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.productName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.sku}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Price</label>
                  <p className="text-lg font-semibold text-[#FF6600]">EGP {viewingProduct.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Stock Quantity</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingProduct.totalStock}</p>
                </div>
                {viewingProduct.brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Brand</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingProduct.brand}</p>
                  </div>
                )}
                {viewingProduct.warranty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Warranty</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingProduct.warranty}</p>
                  </div>
                )}
                {viewingProduct.rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Rating</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingProduct.rating} / 5</p>
                  </div>
                )}
              </div>

              {/* Marketplace Listings */}
              <div>
                <h4 className="font-semibold text-lg text-[#003366] mb-3">Marketplace Listings</h4>
                <div className="space-y-3">
                  {viewingProduct.channels.map((channel) => (
                    <div
                      key={channel.channelId}
                      className="p-4 border-2 border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{channel.channelName}</h5>
                        <div className="flex items-center gap-2">
                          {getSyncStatusIcon(channel.syncStatus)}
                          <span className={`text-sm px-2 py-1 rounded ${channel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {channel.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">External ID:</span>
                          <span className="ml-2 font-medium">{channel.externalId || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-2 font-medium">EGP {channel.price}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Last Synced:</span>
                          <span className="ml-2 font-medium">{formatDate(channel.lastSyncedAt)}</span>
                        </div>
                        {channel.syncError && (
                          <div className="col-span-2 text-red-600 text-xs">
                            Error: {channel.syncError}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#003366]">Edit Product</h3>
              <button
                onClick={cancelEditing}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold text-lg text-[#003366] mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct.productName}
                      onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing and Stock */}
              <div>
                <h4 className="font-semibold text-lg text-[#003366] mb-4">Pricing & Stock</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (EGP)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Old Price (EGP)</label>
                    <input
                      type="number"
                      value={editingProduct.oldPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={editingProduct.totalStock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, totalStock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="font-semibold text-lg text-[#003366] mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warranty</label>
                    <input
                      type="text"
                      value={editingProduct.warranty || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                      placeholder="e.g., 2 Years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <input
                      type="number"
                      value={editingProduct.rating || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600]"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="0.0 - 5.0"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={saveProduct}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
