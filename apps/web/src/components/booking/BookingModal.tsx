import { X, Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
    id: string;
    name: string;
    city: string;
    dealerName: string;
    startDate: Date;
    endDate: Date;
    address: string;
    latitude: number;
    longitude: number;
    availableSlots: number;
}

interface BookingModalProps {
    event: Event | null;
    isOpen: boolean;
    onClose: () => void;
    onBookNow: (eventId: string) => void;
}

export default function BookingModal({ event, isOpen, onClose, onBookNow }: BookingModalProps) {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header avec image de fond */}
                <div className="relative h-48 bg-gradient-to-br from-yamaha-blue via-blue-700 to-blue-900 overflow-hidden">
                    {/* Pattern décoratif */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}></div>
                    </div>

                    {/* Bouton fermer */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all duration-200 group"
                    >
                        <X className="text-white group-hover:rotate-90 transition-transform duration-200" size={24} />
                    </button>

                    {/* Titre */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                        <h2 className="text-3xl font-bold text-white mb-1">
                            Demo Ride Tour {event.city}
                        </h2>
                        <p className="text-white/90 text-sm flex items-center">
                            <MapPin size={16} className="mr-1" />
                            {event.dealerName}
                        </p>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start">
                                <div className="p-2 bg-yamaha-blue rounded-lg mr-3">
                                    <Calendar className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {format(new Date(event.startDate), 'dd', { locale: fr })} &{' '}
                                        {format(new Date(event.endDate), 'dd MMMM yyyy', { locale: fr })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Horaires */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-start">
                                <div className="p-2 bg-purple-600 rounded-lg mr-3">
                                    <Clock className="text-white" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Horaires</p>
                                    <p className="text-lg font-bold text-gray-900">9h00 - 18h00</p>
                                    <p className="text-xs text-gray-600">Sessions toutes les 30min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start">
                            <MapPin className="text-yamaha-blue mr-3 flex-shrink-0 mt-1" size={20} />
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Adresse</p>
                                <p className="text-gray-900 font-medium">{event.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Places disponibles */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border-2 border-green-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-600 rounded-xl mr-4">
                                    <Users className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Places disponibles</p>
                                    <p className="text-3xl font-bold text-green-700">{event.availableSlots}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold">
                                    ✓ Disponible
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations importantes */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-amber-800">À prévoir pour votre essai</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    • Permis de conduire valide (A ou A2)<br />
                                    • Pièce d'identité<br />
                                    • Équipement complet (casque, gants, blouson, pantalon, bottes)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de réservation */}
                    <button
                        onClick={() => onBookNow(event.id)}
                        className="w-full bg-gradient-to-r from-yamaha-red to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center group"
                    >
                        <span className="text-lg">RÉSERVER MON ESSAI GRATUIT</span>
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        En réservant, vous acceptez nos conditions générales d'utilisation
                    </p>
                </div>
            </div>
        </div>
    );
}
