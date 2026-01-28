
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ChevronRight, Check, Calendar, Clock, MapPin, Bike, AlertCircle, ArrowLeft } from 'lucide-react';

// Types
interface Motorcycle {
    id: string;
    model: string;
    imageUrl: string;
    group: 'GROUP_1' | 'GROUP_2';
    requiredLicense: 'A' | 'A2' | 'A1';
    isYAMT: boolean;
}

interface Session {
    id: string;
    startTime: string;
    endTime: string;
    availableSlots: number;
    bookedSlots: number;
    _count: { bookings: number };
}

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseType: string;
}

export default function BookingWizardPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Selection state
    const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseType: '',
    });

    // Fetch Event Details
    const { data: event, isLoading: isLoadingEvent } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const res = await fetch(`/api/events/${eventId}`);
            if (!res.ok) throw new Error('Event not found');
            return res.json();
        },
    });

    // Fetch Available Motorcycles
    const { data: motorcycles, isLoading: isLoadingMotos } = useQuery({
        queryKey: ['motorcycles', eventId],
        queryFn: async () => {
            const res = await fetch(`/api/motorcycles/available?eventId=${eventId}`);
            if (!res.ok) throw new Error('Failed to fetch motorcycles');
            return res.json();
        },
        enabled: !!eventId,
    });

    // Fetch Sessions (when motorcycle selected)
    const { data: sessions, isLoading: isLoadingSessions } = useQuery({
        queryKey: ['sessions', eventId, selectedMotorcycle?.group],
        queryFn: async () => {
            if (!selectedMotorcycle) return [];
            const res = await fetch(`/api/sessions?eventId=${eventId}&group=${selectedMotorcycle.group}`);
            if (!res.ok) throw new Error('Failed to fetch sessions');
            return res.json();
        },
        enabled: !!selectedMotorcycle,
    });

    // Navigation handlers
    const handleModelSelect = (moto: Motorcycle) => {
        setSelectedMotorcycle(moto);
        setSelectedDate(null); // Reset date selection
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSessionSelect = (session: Session) => {
        setSelectedSession(session);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUserInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fonction pour normaliser le numéro de téléphone français en format international
    const normalizePhoneNumber = (phone: string): string => {
        // Supprimer tous les espaces, points, tirets
        let cleaned = phone.replace(/[\s.\-()]/g, '');

        // Si le numéro commence par 0, le remplacer par +33
        if (cleaned.startsWith('0')) {
            cleaned = '+33' + cleaned.substring(1);
        }
        // Si le numéro ne commence pas par +, ajouter +33
        else if (!cleaned.startsWith('+')) {
            cleaned = '+33' + cleaned;
        }

        return cleaned;
    };

    // Mutation pour créer la réservation
    const createBookingMutation = useMutation({
        mutationFn: async () => {
            // Utiliser un mot de passe déterministe basé sur l'email pour permettre les réservations multiples
            const password = `Yamaha${userInfo.email.split('@')[0]}2026!`;

            // Normaliser le numéro de téléphone
            const normalizedPhone = normalizePhoneNumber(userInfo.phone);

            console.log('🚀 Starting booking process...');
            console.log('📧 Email:', userInfo.email);
            console.log('📱 Phone (original):', userInfo.phone);
            console.log('📱 Phone (normalized):', normalizedPhone);
            console.log('🔐 Password:', password);

            // 1. Essayer de créer l'utilisateur
            console.log('📝 Attempting registration...');
            const userResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    password: password,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    phone: normalizedPhone,
                    licenseType: userInfo.licenseType,
                }),
            });

            console.log('📝 Registration response status:', userResponse.status);

            let token;

            if (userResponse.ok) {
                // Nouvel utilisateur créé
                console.log('✅ Registration successful!');
                const userData = await userResponse.json();
                token = userData.token;
                console.log('🎫 Token received:', token?.substring(0, 20) + '...');
            } else if (userResponse.status === 409) {
                // Utilisateur existe déjà, se connecter avec le même mot de passe
                console.log('⚠️ User exists, attempting login...');
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userInfo.email,
                        password: password,
                    }),
                });

                console.log('🔑 Login response status:', loginResponse.status);

                if (!loginResponse.ok) {
                    const errorData = await loginResponse.json();
                    console.error('❌ Login failed:', errorData);
                    throw new Error('Erreur de connexion. Impossible de finaliser la réservation.');
                }

                const loginData = await loginResponse.json();
                token = loginData.token;
                console.log('✅ Login successful! Token:', token?.substring(0, 20) + '...');
            } else {
                const errorData = await userResponse.json();
                console.error('❌ Registration failed:', errorData);
                throw new Error(errorData.message || 'Erreur lors de la création du compte');
            }

            // 2. Créer la réservation
            console.log('🏍️ Creating booking...');
            console.log('📦 Booking data:', {
                eventId: eventId,
                motorcycleId: selectedMotorcycle?.id,
                sessionId: selectedSession?.id,
            });

            const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: eventId,
                    motorcycleId: selectedMotorcycle?.id,
                    sessionId: selectedSession?.id,
                }),
            });

            console.log('🏍️ Booking response status:', bookingResponse.status);

            if (!bookingResponse.ok) {
                const error = await bookingResponse.json();
                console.error('❌ Booking failed:', error);
                throw new Error(error.message || 'Erreur lors de la réservation');
            }

            const bookingData = await bookingResponse.json();
            console.log('✅ Booking created successfully!', bookingData);
            return bookingData;
        },
        onSuccess: () => {
            toast.success('Réservation confirmée !');
            setStep(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la réservation');
            console.error('Booking error:', error);
        },
    });

    const handleConfirm = () => {
        createBookingMutation.mutate();
    };

    if (isLoadingEvent) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yamaha-blue"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-r from-gray-900 to-yamaha-blue pb-32 pt-32 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <button
                        onClick={() => navigate('/reserver')}
                        className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Retour aux événements
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Réserver votre essai
                    </h1>
                    <div className="flex items-center text-white/90 text-lg">
                        <MapPin size={20} className="mr-2 text-yamaha-red" />
                        <span className="font-medium mr-6">{event?.name}</span>
                        <Calendar size={20} className="mr-2 text-yamaha-red" />
                        <span>{event?.city}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-24 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
                    {/* Stepper */}
                    <div className="bg-gray-50 border-b px-6 py-4">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex flex-col items-center relative z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${step >= s
                                            ? 'bg-yamaha-blue border-yamaha-blue text-white shadow-lg scale-110'
                                            : 'bg-white border-gray-300 text-gray-400'
                                            }`}
                                    >
                                        {step > s ? <Check size={20} /> : s}
                                    </div>
                                    <span className={`text-xs font-semibold mt-2 uppercase tracking-wide transition-colors ${step >= s ? 'text-yamaha-blue' : 'text-gray-400'
                                        }`}>
                                        {s === 1 && 'Modèle'}
                                        {s === 2 && 'Créneau'}
                                        {s === 3 && 'Vos infos'}
                                        {s === 4 && 'Confirmation'}
                                    </span>
                                </div>
                            ))}
                            {/* Progress Bar Background */}
                            <div className="absolute top-9 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block" style={{ left: '50%', transform: 'translateX(-50%)', maxWidth: 'calc(100% - 140px)' }}></div>
                            {/* Active Progress Bar */}
                            <div
                                className="absolute top-9 left-0 h-0.5 bg-yamaha-blue -z-0 transition-all duration-500 hidden md:block"
                                style={{
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    maxWidth: 'calc(100% - 140px)',
                                    width: `${((step - 1) / 3) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 md:p-10">

                        {/* STEP 1: SELECT MODEL */}
                        {step === 1 && (
                            <div className="animate-slideUp">
                                <h2 className="text-2xl font-bold mb-2 text-gray-900">Choisissez votre monture</h2>
                                <p className="text-gray-500 mb-8">Sélectionnez la moto que vous souhaitez essayer lors de cet événement.</p>

                                {isLoadingMotos ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {motorcycles?.map((moto: Motorcycle) => (
                                            <div
                                                key={moto.id}
                                                onClick={() => handleModelSelect(moto)}
                                                className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                                            >
                                                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                                    <img
                                                        src={moto.imageUrl || 'https://placehold.co/600x400?text=Yamaha+Moto'}
                                                        alt={moto.model}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 right-3">
                                                        <span className="bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                            PERMIS {moto.requiredLicense}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-yamaha-blue transition-colors">{moto.model}</h3>
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <span className={`text-xs px-2 py-1 rounded font-medium ${moto.isYAMT
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {moto.isYAMT ? '⚡ Boîte Automatique Y-AMT' : '⚙️ Boîte Manuelle'}
                                                        </span>
                                                    </div>
                                                    <button className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-lg group-hover:bg-yamaha-red group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                                        CHOISIR CE MODÈLE
                                                        <ChevronRight size={18} className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: SELECT SESSION */}
                        {step === 2 && (
                            <div className="animate-slideUp">
                                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center transition-colors">
                                    <ArrowLeft size={16} className="mr-1" /> Retour aux modèles
                                </button>

                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choisissez votre créneau</h2>
                                        <p className="text-gray-500">Sélectionnez la date et l'heure de votre départ.</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                        <img src={selectedMotorcycle?.imageUrl} alt="" className="w-12 h-12 rounded object-cover mr-3 bg-white" />
                                        <div>
                                            <p className="text-xs text-blue-600 font-semibold uppercase">Modèle sélectionné</p>
                                            <p className="font-bold text-gray-900">{selectedMotorcycle?.model}</p>
                                        </div>
                                    </div>
                                </div>

                                {isLoadingSessions ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {/* Date Selection */}
                                        {(() => {
                                            if (!Array.isArray(sessions)) return null;

                                            // Extract unique dates
                                            const dates = Array.from(new Set(sessions.map(s => new Date(s.startTime).toLocaleDateString('fr-CA')))).sort();

                                            if (dates.length === 0) return null;

                                            // Initialize selectedDate if not set (using a separate effect or inline logic is tough, so we'll handle filteredSessions logic below)
                                            // Ideally we should use state, but we can default to the first date if selectedDate is unset.
                                            // Let's use a local variable for rendering if state is missing
                                            const effectiveDate = selectedDate || dates[0];

                                            return (
                                                <div className="mb-8">
                                                    {dates.length > 1 && (
                                                        <div className="flex flex-wrap gap-3 mb-6">
                                                            {dates.map(dateStr => {
                                                                const dateObj = new Date(dateStr);
                                                                const isSelected = effectiveDate === dateStr;

                                                                return (
                                                                    <button
                                                                        key={dateStr}
                                                                        onClick={() => setSelectedDate(dateStr)}
                                                                        className={`px-6 py-3 rounded-lg border-2 font-semibold transition-all ${isSelected
                                                                            ? 'bg-yamaha-blue border-yamaha-blue text-white shadow-md'
                                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                                            }`}
                                                                    >
                                                                        <div className="text-xs uppercase opacity-80">
                                                                            {dateObj.toLocaleDateString('fr-FR', { weekday: 'long' })}
                                                                        </div>
                                                                        <div className="text-lg">
                                                                            {dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Sessions Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {sessions
                                                            .filter(s => new Date(s.startTime).toLocaleDateString('fr-CA') === effectiveDate)
                                                            .map((session: Session) => {
                                                                const date = new Date(session.startTime);
                                                                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                                const isFull = session.bookedSlots >= session.availableSlots;
                                                                const spotsLeft = session.availableSlots - session.bookedSlots;

                                                                return (
                                                                    <button
                                                                        key={session.id}
                                                                        disabled={isFull}
                                                                        onClick={() => handleSessionSelect(session)}
                                                                        className={`relative p-5 border-2 rounded-xl text-left transition-all duration-200 ${isFull
                                                                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60'
                                                                            : 'bg-white border-gray-100 hover:border-yamaha-blue hover:shadow-lg group'
                                                                            }`}
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <Clock size={20} className={isFull ? 'text-gray-300' : 'text-yamaha-blue'} />
                                                                            {!isFull && (
                                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${spotsLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                                                    }`}>
                                                                                    {spotsLeft} places
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className={`text-2xl font-bold mb-1 ${isFull ? 'text-gray-300' : 'text-gray-900'}`}>
                                                                            {timeStr}
                                                                        </div>
                                                                        <div className={`text-xs font-medium uppercase ${isFull ? 'text-red-400' : 'text-gray-500'}`}>
                                                                            {isFull ? 'Complet' : 'Disponible'}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}

                                                        {sessions.length === 0 && (
                                                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl">
                                                                <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                                                                <p className="text-gray-500 font-medium">Aucun créneau disponible pour ce modèle.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        )}

                        {/* STEP 3: USER INFO */}
                        {step === 3 && (
                            <div className="animate-slideUp max-w-2xl mx-auto">
                                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center transition-colors">
                                    <ArrowLeft size={16} className="mr-1" /> Retour aux créneaux
                                </button>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos informations</h2>
                                    <p className="text-gray-500">Remplissez ce formulaire pour valider votre essai.</p>
                                </div>

                                <form onSubmit={handleUserInfoSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Prénom <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yamaha-blue focus:border-transparent transition-all outline-none"
                                                placeholder="Jean"
                                                value={userInfo.firstName}
                                                onChange={e => setUserInfo({ ...userInfo, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Nom <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yamaha-blue focus:border-transparent transition-all outline-none"
                                                placeholder="Dupont"
                                                value={userInfo.lastName}
                                                onChange={e => setUserInfo({ ...userInfo, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yamaha-blue focus:border-transparent transition-all outline-none"
                                            placeholder="jean.dupont@email.com"
                                            value={userInfo.email}
                                            onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yamaha-blue focus:border-transparent transition-all outline-none"
                                                placeholder="06 12 34 56 78"
                                                value={userInfo.phone}
                                                onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Type de permis <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yamaha-blue focus:border-transparent transition-all outline-none bg-white"
                                                value={userInfo.licenseType}
                                                onChange={e => setUserInfo({ ...userInfo, licenseType: e.target.value })}
                                            >
                                                <option value="">Sélectionnez...</option>
                                                <option value="A">Permis A (Toutes motos)</option>
                                                <option value="A2">Permis A2 (35kW)</option>
                                                <option value="A1">Permis A1 (125cc)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {selectedMotorcycle && userInfo.licenseType && (
                                        (selectedMotorcycle.requiredLicense === 'A' && userInfo.licenseType !== 'A') ||
                                        (selectedMotorcycle.requiredLicense === 'A2' && userInfo.licenseType === 'A1')
                                    ) && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-fadeIn">
                                                <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="text-sm font-bold text-red-800">Permis non valide</p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Le modèle <strong>{selectedMotorcycle.model}</strong> nécessite un permis <strong>{selectedMotorcycle.requiredLicense}</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-yamaha-red to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center"
                                        >
                                            PASSER AU RÉCAPITULATIF <ChevronRight className="ml-2" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 4: CONFIRMATION */}
                        {step === 4 && (
                            <div className="animate-slideUp max-w-3xl mx-auto">
                                <button onClick={() => setStep(3)} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center transition-colors">
                                    <ArrowLeft size={16} className="mr-1" /> Modifier mes infos
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Récapitulatif de votre réservation</h2>

                                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-8">
                                    <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                                        <h3 className="font-bold text-gray-700 flex items-center">
                                            <Bike size={20} className="mr-2 text-yamaha-blue" />
                                            Votre Essai
                                        </h3>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Gratuit</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex items-start">
                                            <img
                                                src={selectedMotorcycle?.imageUrl}
                                                alt={selectedMotorcycle?.model}
                                                className="w-24 h-24 object-cover rounded-lg bg-gray-100 mr-4"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Moto</p>
                                                <p className="text-xl font-bold text-gray-900 mb-2">{selectedMotorcycle?.model}</p>
                                                <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded text-gray-600">
                                                    {selectedMotorcycle?.isYAMT ? 'Automatique (Y-AMT)' : 'Manuelle'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date & Heure</p>
                                                <p className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <Calendar size={18} className="mr-2 text-gray-400" />
                                                    {selectedSession && new Date(selectedSession.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 flex items-center mt-1">
                                                    <Clock size={18} className="mr-2 text-gray-400" />
                                                    {selectedSession && new Date(selectedSession.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Conducteur</p>
                                                <p className="font-medium text-gray-900">{userInfo.firstName} {userInfo.lastName}</p>
                                                <p className="text-sm text-gray-600">{userInfo.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <p className="text-xs text-gray-500 text-center md:text-left max-w-md">
                                        En cliquant sur "Confirmer", j'accepte d'être contacté par Yamaha et ses partenaires dans le cadre de cet essai.
                                    </p>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={createBookingMutation.isPending}
                                        className="w-full md:w-auto bg-yamaha-red text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl hover:scale-105 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {createBookingMutation.isPending ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                RÉSERVATION EN COURS...
                                            </span>
                                        ) : (
                                            'CONFIRMER LA RÉSERVATION'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 5 && (
                            <div className="animate-slideUp text-center py-10">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-[bounce_1s_infinite]">
                                    <Check size={48} className="text-green-600" />
                                </div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Réservation confirmée !</h2>
                                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Merci <strong>{userInfo.firstName}</strong>. Votre essai de la <span className="text-yamaha-blue font-bold">{selectedMotorcycle?.model}</span> est programmé. Vous allez recevoir un email de confirmation avec tous les détails.
                                </p>

                                <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl max-w-2xl mx-auto mb-10 text-left">
                                    <h3 className="text-lg font-bold text-yamaha-blue mb-4 flex items-center">
                                        <AlertCircle className="mr-2" />
                                        Informations importantes pour le jour J
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                                            <span className="text-gray-700">Présentez-vous <strong>20 minutes avant</strong> l'heure de votre essai pour le briefing.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                                            <span className="text-gray-700">N'oubliez pas votre <strong>permis de conduire original</strong> (pas de photocopie).</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                                            <span className="text-gray-700">Equipement obligatoire : Casque homologué, gants, blouson motard, pantalon long et chaussures montantes.</span>
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    RETOUR À L'ACCUEIL
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

