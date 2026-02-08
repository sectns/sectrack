import { useState } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import { format, addWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SemesterSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (startDate: string) => Promise<void>;
    currentStart?: string;
}

export default function SemesterSettingsModal({
    isOpen,
    onClose,
    onSave,
    currentStart
}: SemesterSettingsModalProps) {
    const [startDate, setStartDate] = useState(currentStart || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    // Calculate end date (Start + 14 weeks)
    const endDate = startDate ? addWeeks(new Date(startDate), 14) : null;

    const handleSave = async () => {
        // Validation
        if (!startDate) {
            setError('Lütfen dönem başlangıç tarihini seçin');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await onSave(startDate);
            onClose();
        } catch (err) {
            setError('Kaydetme sırasında bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            Dönem Ayarları
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-6">
                    Dönem başlangıç tarihini belirleyin. Sistem otomatik olarak 14 haftalık dönem hesaplayacak.
                </p>

                {/* Form */}
                <div className="space-y-4">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Dönem Başlangıcı
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-modern"
                        />
                    </div>

                    {/* Preview */}
                    {startDate && endDate && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Başlangıç:</span>
                                <span className="text-emerald-400 font-medium">
                                    {format(new Date(startDate), 'd MMMM yyyy', { locale: tr })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Bitiş (Otomatik):</span>
                                <span className="text-emerald-400 font-medium">
                                    {format(endDate, 'd MMMM yyyy', { locale: tr })}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-emerald-500/20">
                                <span className="text-xs text-emerald-400/70">
                                    📅 14 haftalık dönem
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 btn-secondary"
                        disabled={saving}
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
