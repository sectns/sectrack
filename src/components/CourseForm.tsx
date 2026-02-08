import { useState } from 'react';
import { CourseFormData } from '@/types';
import { X, Save } from 'lucide-react';

interface CourseFormProps {
    onSubmit: (data: CourseFormData) => Promise<void>;
    onCancel: () => void;
    initialData?: CourseFormData;
}

export default function CourseForm({ onSubmit, onCancel, initialData }: CourseFormProps) {
    const [formData, setFormData] = useState<CourseFormData>(
        initialData || {
            name: '',
            course_code: '',
            t_hours: 0,
            u_hours: 0,
            t_limit_percent: 30,
            u_limit_percent: 20,
            color_code: '#00ff41'
        }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation
            if (!formData.name.trim()) {
                throw new Error('Ders adı gereklidir');
            }
            if (formData.t_hours === 0 && formData.u_hours === 0) {
                throw new Error('En az bir ders saati (T veya U) girilmelidir');
            }

            await onSubmit(formData);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="card-cyber max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-matrix-green/30">
                    <h2 className="text-xl font-mono text-matrix-green">
                        &gt; {initialData ? 'DERS DÜZENLE' : 'YENİ DERS EKLE'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-matrix-green/10 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-matrix-green" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Course Name */}
                    <div>
                        <label className="block text-matrix-green font-mono text-sm mb-2">
                            DERS ADI *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-cyber"
                            placeholder="örn: Veri Yapıları"
                            required
                        />
                    </div>

                    {/* Course Code */}
                    <div>
                        <label className="block text-matrix-green font-mono text-sm mb-2">
                            DERS KODU (Opsiyonel)
                        </label>
                        <input
                            type="text"
                            value={formData.course_code}
                            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                            className="input-cyber"
                            placeholder="örn: YZM202"
                        />
                    </div>

                    {/* Hours Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Theory Hours */}
                        <div>
                            <label className="block text-matrix-green font-mono text-sm mb-2">
                                TEORİK SAAT (T) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={formData.t_hours}
                                onChange={(e) => setFormData({ ...formData, t_hours: parseInt(e.target.value) || 0 })}
                                className="input-cyber"
                                placeholder="0"
                            />
                            <p className="text-matrix-green/50 text-xs font-mono mt-1">
                                Haftalık teorik ders saati
                            </p>
                        </div>

                        {/* Practice Hours */}
                        <div>
                            <label className="block text-matrix-green font-mono text-sm mb-2">
                                UYGULAMA SAAT (U) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={formData.u_hours}
                                onChange={(e) => setFormData({ ...formData, u_hours: parseInt(e.target.value) || 0 })}
                                className="input-cyber"
                                placeholder="0"
                            />
                            <p className="text-matrix-green/50 text-xs font-mono mt-1">
                                Haftalık uygulama ders saati
                            </p>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="border border-matrix-green/30 rounded p-4">
                        <h3 className="text-matrix-green font-mono text-sm mb-4">
                            DEVAMSIZLIK LİMİTLERİ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theory Limit */}
                            <div>
                                <label className="block text-matrix-green font-mono text-sm mb-2">
                                    TEORİK LİMİT (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.t_limit_percent}
                                    onChange={(e) => setFormData({ ...formData, t_limit_percent: parseFloat(e.target.value) || 30 })}
                                    className="input-cyber"
                                />
                                <p className="text-matrix-green/50 text-xs font-mono mt-1">
                                    Varsayılan: %30
                                </p>
                            </div>

                            {/* Practice Limit */}
                            <div>
                                <label className="block text-matrix-green font-mono text-sm mb-2">
                                    UYGULAMA LİMİT (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.u_limit_percent}
                                    onChange={(e) => setFormData({ ...formData, u_limit_percent: parseFloat(e.target.value) || 20 })}
                                    className="input-cyber"
                                />
                                <p className="text-matrix-green/50 text-xs font-mono mt-1">
                                    Varsayılan: %20
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-matrix-green font-mono text-sm mb-2">
                            RENK KODU
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                value={formData.color_code}
                                onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                className="h-12 w-20 bg-dark-gray border border-matrix-green/30 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.color_code}
                                onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                className="input-cyber flex-1"
                                placeholder="#00ff41"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-neon-red/10 border border-neon-red/50 rounded p-3">
                            <p className="text-neon-red text-sm font-mono">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 rounded text-gray-400 font-mono transition-all"
                            disabled={loading}
                        >
                            İPTAL
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-neon py-3 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'KAYDEDILIYOR...' : 'KAYDET'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
