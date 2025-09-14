import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type IconName = "user" | "lock" | "arrow-right";

interface IconProps {
  name: IconName;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  const icons = {
    user: PersonIcon,
    lock: LockIcon,
    "arrow-right": ArrowForwardIcon,
  };

  const Component = icons[name];
  return <Component className={className} />;
}
