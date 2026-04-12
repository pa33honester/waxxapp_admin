// components/common/InfoTooltip.js
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Custom styled tooltip
const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#fff",
        color: "#1f1f1f",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        fontSize: "13px",
        borderRadius: "8px",
        padding: "12px 14px",
        maxWidth: 350,
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: "#fff",
    },
}));

const InfoTooltip = ({ title, content }) => {
    return (
        <LightTooltip
            title={
                <div>
                    <h6 style={{ margin: "0 0 8px 0", fontWeight: "600" }}>{title}</h6>
                    {content?.map((item, index) => (
                        <div key={index} style={{ marginBottom: "8px" }}>
                            <strong>{item.label}</strong>
                            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4" }}>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            }
            arrow
            placement="bottom"
        >
            <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" color="action" />
            </IconButton>
        </LightTooltip>
    );
};

export default InfoTooltip;
