import defaultImage from "../../assets/images/default.jpg";
import { baseURL } from "../../util/config";


const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return defaultImage;
  
  let formattedUrl = imageUrl.replace(/\\/g, '/');
  
  if (!formattedUrl.startsWith('http')) {
    formattedUrl = `${baseURL}${formattedUrl}`;
  }
  
  return formattedUrl;
};

export default formatImageUrl;