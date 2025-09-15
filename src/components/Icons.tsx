import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/EnhancedEncryption";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmailIcon from "@mui/icons-material/Email";

type IconName =
  "user" |
  "lock" |
  "arrow-right" |
  "email";

interface IconProps {
  name: IconName;
  className?: string;
  fontSize?: "inherit" | "small" | "medium" | "large";
}

export default function Icon({ name, className, fontSize }: IconProps) {
  const icons = {
    user: PersonIcon,
    lock: LockIcon,
    "arrow-right": ArrowForwardIcon,
    email: EmailIcon
  } as const satisfies Record<IconName, React.ElementType>;

  const Component = icons[name];
  return <Component className={className} fontSize={fontSize}/>;
}
