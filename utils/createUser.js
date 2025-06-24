const MediBotUser = require('../models/mediBotUserSchema');

async function createUser(ProfileName,From)
{
    let user=await MediBotUser.findOne({phone:From})
    if(!user)
        {
            user=new MediBotUser({username:ProfileName,phone:From})
            await user.save()
            return user;
    }
    return user;
}

module.exports = createUser;