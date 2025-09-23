import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/EnhancedEncryption";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmailIcon from "@mui/icons-material/Email";

type IconName = "user" | "lock" | "arrow-right" | "email";

interface IconProps {
  name: IconName;
  className?: string;
  fontSize?: "inherit" | "small" | "medium" | "large";
}

export default function Icon({ name, className, fontSize }: IconProps) {
  let Component;

  switch (name) {
    case "user": Component = PersonIcon;
      break;
    case "lock": Component = LockIcon;
      break;
    case "arrow-right": Component = ArrowForwardIcon;
      break;
    case "email": Component = EmailIcon;
      break;
    default:
      Component = PersonIcon;
  }

  return <Component className={className} fontSize={fontSize} />;
}
