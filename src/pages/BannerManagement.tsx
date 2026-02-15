import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react';
import { bannersApi, Banner } from '../api/banners.api';

interface BannerManagementProps {
    onNavigate?: (page: 'home' | 'admin' | 'banners') => void;
}

export function BannerManagement({ onNavigate }: BannerManagementProps) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const data = await bannersApi.getAllBanners();
            setBanners(data);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            alert('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
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
            setFormData({
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
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingBanner && !imageFile) {
            alert('Please upload an image');
            return;
        }

        try {
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('subtitle', formData.subtitle);
            formPayload.append('ctaText', formData.ctaText);
            formPayload.append('ctaLink', formData.ctaLink);
            formPayload.append('bgGradient', formData.bgGradient);
            formPayload.append('isActive', formData.isActive.toString());
            formPayload.append('sortOrder', formData.sortOrder.toString());

            if (imageFile) {
                formPayload.append('image', imageFile);
            }

            if (editingBanner) {
                await bannersApi.updateBanner(editingBanner.id, formPayload);
            } else {
                await bannersApi.createBanner(formPayload);
            }

            await fetchBanners();
            handleCloseModal();
            alert(editingBanner ? 'Banner updated!' : 'Banner created!');
        } catch (error) {
            console.error('Failed to save banner:', error);
            alert('Failed to save banner');
        }
    };

    const handleDelete = async (id: string) => {
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

    const toggleActive = async (banner: Banner) => {
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

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8]">
            {/* Header */}
            <div className="bg-[#003366] text-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-3xl font-bold mb-2">Banner Management</h1>
                            <p className="text-white/80">Manage carousel banners for the homepage</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onNavigate?.('admin')}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                ← Back to Dashboard
                            </button>
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Back to Shop
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">Current Banners</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-[#FF6600] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#FF6600]/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Banner
                    </button>
                </div>

                <div className="grid gap-6">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="bg-white rounded-lg shadow-md p-6 flex gap-6"
                        >
                            <img
                                src={banner.imageUrl}
                                alt={banner.title}
                                className="w-48 h-32 object-cover rounded"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{banner.title}</h3>
                                        <p className="text-gray-600">{banner.subtitle}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            CTA: {banner.ctaText} → {banner.ctaLink || 'No link'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Sort Order: {banner.sortOrder}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleActive(banner)}
                                            className={`p-2 rounded ${banner.isActive
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                            title={banner.isActive ? 'Active' : 'Inactive'}
                                        >
                                            {banner.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(banner)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingBanner ? 'Edit Banner' : 'Create Banner'}
                                </h2>
                                <button onClick={handleCloseModal}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Subtitle *</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">CTA Text *</label>
                                    <input
                                        type="text"
                                        value={formData.ctaText}
                                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">CTA Link</label>
                                    <input
                                        type="text"
                                        value={formData.ctaLink}
                                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="/products"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Background Gradient</label>
                                    <select
                                        value={formData.bgGradient}
                                        onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
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
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        className="w-full border rounded px-3 py-2"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto mb-4 rounded" />
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
                                        onClick={handleCloseModal}
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
        </div>
    );
}
