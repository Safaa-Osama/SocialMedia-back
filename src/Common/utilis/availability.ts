import { availabilityEnum } from './../enum/postEnum';
import { Request } from 'express';


export const postAvailability = (req: Request) => {
    return{$or: [
        { availability: availabilityEnum.public },
        { availability: availabilityEnum.onlyMe, createdBy: req.user?._id },
        {
            availability: availabilityEnum.friends,
            createdBy: { $in: [...(req.user?.friends || []), req.user?._id] }
        },
        { tags: { $in: [req.user?._id] } }
    ]}


}