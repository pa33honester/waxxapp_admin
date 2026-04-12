import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const Navigator = (props) => {
  const location = useLocation();
  const {
    name,
    path,
    path2,
    path3,
    iconName, // use iconName instead of navIcon/navIconImg
    onClick,
    children,
  } = props;

  const isActiveMain = location.pathname === path || location.pathname === path2 || location.pathname === path3 ;
  const Icon = iconName && LucideIcons[iconName] ? LucideIcons[iconName] : null;

  return (
    <ul className="mainMenu">
      <li onClick={onClick}>
        <Link
          to={path || "#"}
          className={`menu-link ${isActiveMain ? "activeMenu no-hover" : ""}`}
        >
          <div className="activemenu d-flex align-items-center gap-1">
            {Icon && <Icon size={18} className="me-1 text-gray-700" />}
            <span className="normal-case">{name}</span>
          </div>
          {children && <i className="fa-solid fa-angle-right rightangel"></i>}
        </Link>

        {/* Submenu */}
        <ul className="subMenu transform0">
          {children?.map((child, index) => {
            const { subName, subPath, subPath2,subPath3, onClick2 } = child?.props;
            const isActiveSub = location.pathname === subPath || location.pathname === subPath2 || location.pathname === subPath3;

            return (
              <li key={index} onClick={onClick2}>
                <Link
                  to={subPath}
                  className={`submenu-link ${isActiveSub ? "activeMenu no-hover" : ""}`}
                >
                  <i className="fa-solid fa-circle me-2"></i>
                  <span>{subName}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </li>
    </ul>
  );
};

export default Navigator;
