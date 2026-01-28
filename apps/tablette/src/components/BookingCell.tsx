import type { Booking, Motorcycle } from '../types';

interface BookingCellProps {
  motorcycle: Motorcycle;
  timeSlot?: string;
  booking?: Booking;
  onClick: () => void;
}

export default function BookingCell({
  motorcycle,
  booking,
  onClick,
}: BookingCellProps) {
  // Get cell background color based on status
  const getCellColor = () => {
    if (motorcycle.status === 'UNAVAILABLE') {
      return 'bg-status-unavailable cursor-not-allowed';
    }

    if (!booking) {
      return 'bg-status-available hover:bg-gray-50 cursor-pointer';
    }

    switch (booking.status) {
      case 'RESERVED':
        return 'bg-status-reserved cursor-pointer hover:bg-blue-100';
      case 'CONFIRMED':
      case 'READY':
        return 'bg-status-confirmed cursor-pointer hover:bg-green-100';
      case 'IN_PROGRESS':
        return 'bg-status-in-progress cursor-pointer hover:bg-yellow-100';
      case 'COMPLETED':
        return 'bg-status-completed cursor-not-allowed';
      case 'CANCELLED':
        return 'bg-gray-200 cursor-not-allowed';
      default:
        return 'bg-status-available hover:bg-gray-50 cursor-pointer';
    }
  };

  // Get status label
  const getStatusLabel = () => {
    if (!booking) return '';

    switch (booking.status) {
      case 'RESERVED':
        return 'Réservé';
      case 'CONFIRMED':
        return 'Confirmé';
      case 'READY':
        return 'Prêt';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return '';
    }
  };

  // Check if cell is clickable
  const isClickable =
    motorcycle.status === 'AVAILABLE' &&
    booking?.status !== 'COMPLETED' &&
    booking?.status !== 'CANCELLED';

  return (
    <td
      onClick={isClickable ? onClick : undefined}
      className={`border border-gray-200 p-3 text-center transition-all ${getCellColor()}`}
    >
      {booking ? (
        <div className="min-h-[80px] flex flex-col items-center justify-center">
          {/* Client Name */}
          <div className="font-semibold text-gray-800 text-sm mb-1">
            {booking.user.firstName} {booking.user.lastName.charAt(0)}.
          </div>

          {/* Status Badge */}
          <div className="text-xs text-gray-600 mb-1">{getStatusLabel()}</div>

          {/* Document Status Indicators */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="flex items-center gap-1 text-xs">
              {booking.waiverSigned ? (
                <span className="text-green-600" title="Décharge signée">
                  ✓
                </span>
              ) : (
                <span className="text-red-600" title="Décharge non signée">
                  ✗
                </span>
              )}
              {booking.licensePhotoUrl ? (
                <span className="text-green-600" title="Photo permis">
                  📷
                </span>
              ) : (
                <span className="text-gray-400" title="Pas de photo">
                  📷
                </span>
              )}
              {booking.bibNumber ? (
                <span className="text-green-600" title="Dossard attribué">
                  #{booking.bibNumber}
                </span>
              ) : (
                <span className="text-gray-400" title="Pas de dossard">
                  #?
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[80px] flex items-center justify-center">
          {motorcycle.status === 'AVAILABLE' ? (
            <span className="text-gray-400 text-sm">Disponible</span>
          ) : (
            <span className="text-red-600 text-sm font-semibold">
              Indisponible
            </span>
          )}
        </div>
      )}
    </td>
  );
}
