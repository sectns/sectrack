import { useState } from 'react';
import { CourseFormData } from '@/types';
import { X, Save, Check } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

interface CourseFormProps {
    onSubmit: (data: CourseFormData) => Promise<void>;
    onCancel: () => void;
    initialData?: CourseFormData;
}

const PRESET_COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Orange
    '#ec4899', // Pink
    '#ef4444', // Red
];

export default function CourseForm({ onSubmit, onCancel, initialData }: CourseFormProps) {
    const [formData, setFormData] = useState<CourseFormData>(
        initialData || {
            name: '',
            course_code: '',
            t_hours: 0,
            u_hours: 0,
            t_limit_percent: 30,
            u_limit_percent: 20,
            color_code: '#10b981'
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900/90 backdrop-blur-xl max-w-lg w-full rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {initialData ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            Ders bilgilerini ve devamsızlık limitlerini ayarla
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Course Identity */}
                    <div className="space-y-4">
                        <Input
                            label="Ders Adı"
                            placeholder="örn: Veri Yapıları"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Ders Kodu (Opsiyonel)"
                            placeholder="örn: YZM202"
                            value={formData.course_code || ''}
                            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                        />
                    </div>

                    {/* Hours Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="Teorik Saat (T)"
                            placeholder="0"
                            min="0"
                            max="20"
                            value={formData.t_hours}
                            onChange={(e) => setFormData({ ...formData, t_hours: parseInt(e.target.value) || 0 })}
                            helperText="Haftalık T saati"
                        />
                        <Input
                            type="number"
                            label="Uygulama Saat (U)"
                            placeholder="0"
                            min="0"
                            max="20"
                            value={formData.u_hours}
                            onChange={(e) => setFormData({ ...formData, u_hours: parseInt(e.target.value) || 0 })}
                            helperText="Haftalık U saati"
                        />
                    </div>

                    {/* Limits Grid */}
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Devamsızlık Limitleri (%)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Teorik Limit"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.t_limit_percent}
                                onChange={(e) => setFormData({ ...formData, t_limit_percent: parseFloat(e.target.value) || 30 })}
                            />
                            <Input
                                type="number"
                                label="Uygulama Limit"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.u_limit_percent}
                                onChange={(e) => setFormData({ ...formData, u_limit_percent: parseFloat(e.target.value) || 20 })}
                            />
                        </div>
                    </div>

                    {/* Color Picker Swatches */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-300 tracking-tight">
                            Ders Rengi
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color_code: color })}
                                    className={`
                                        w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                                        ${formData.color_code === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}
                                    `}
                                    style={{ backgroundColor: color }}
                                >
                                    {formData.color_code === color && (
                                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                            {/* Manual Color Picker */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-800 hover:border-slate-700 transition-all">
                                <input
                                    type="color"
                                    value={formData.color_code}
                                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-shake">
                            <p className="text-sm font-medium text-red-100">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            fullWidth
                            onClick={onCancel}
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            icon={Save}
                        >
                            {initialData ? 'Güncelle' : 'Kaydet'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
