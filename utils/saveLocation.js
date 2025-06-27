const { default: axios } = require("axios");

async function saveLocation(user,lat,long)
{
    let address = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`
          );
    user["address"] = {
      lat: lat,
      long: long,
      pincode: address.data.address.postcode,
    };
    await user.save();
}

module.exports=saveLocation;