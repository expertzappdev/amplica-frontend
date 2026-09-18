import { useLocation } from 'react-router-dom';
import SuccessScreen from '../../views/auth/authentication/ResetSuccess'; // Adjust the path to your SuccessScreen component
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'; // Example icon for email sent
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Default success icon
const iconMap = {
  'MarkEmailReadIcon': MarkEmailReadIcon,
  'CheckCircleOutlineIcon': CheckCircleOutlineIcon,
};

export default function GenericSuccessPage() {
  const location = useLocation();
  const {
    title,
    message,
    actionButtonText,
    actionButtonTo,
    showLogo,
    iconIdentifier 
  } = location.state || {}; 

  const defaultTitle = "Operation Successful!";
  const defaultMessage = "Your request has been completed successfully.";
  const defaultActionButtonText = "Go to Home";
  const defaultActionButtonTo = "/";
  const defaultShowLogo = true;
  const defaultIconComponent = CheckCircleOutlineIcon; 
  const IconComponent = iconIdentifier ? iconMap[iconIdentifier] : null;

  return (
    <SuccessScreen
      title={title || defaultTitle}
      message={message || defaultMessage}
      actionButtonText={actionButtonText || defaultActionButtonText}
      actionButtonTo={actionButtonTo || defaultActionButtonTo}
      showLogo={typeof showLogo === 'boolean' ? showLogo : defaultShowLogo}
      icon={IconComponent || defaultIconComponent}
    />
  );
}