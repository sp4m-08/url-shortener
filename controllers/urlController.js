import Url from "../models/Url.js"

export const createUrl = async (req,res) => {
    const { originalUrl, shortCode } = req.body;
    
    
    
    if (!originalUrl || !shortCode) {
        res.status(401).json({message:"Provide both original url and your desired shortened url!"})
    }
    
    try {
        const userID = req.user.userId;
        const existingUrl = await Url.findOne({ shortCode });
        if (existingUrl) {
            res.status(409).json({message:"Url is already made! Please enter a different short code!"})
        }
        
        const newUrl = new Url({ originalUrl, shortCode, user: userID })
        await newUrl.save();
        res.status(201).json({ message: 'URL created successfully.', url: newUrl });
    } catch (error) {
        console.error('Error creating URL:', error);
    res.status(500).json({ message: 'Server error while creating URL.' });
    }
}

export const getOriginalUrl = async (req, res) => {
    
    const urlId = req.params.id;
    const userID = req.user.userId;
    try {

        const url = await Url.findOne({ _id: urlId, user: userID });
        if (!url) {
            res.status(404).json({message:"Could not find this Url!"})
        }

        res.status(201).json({ url });

        
    } catch (error) {
        console.error('Error fetching URL:', error);
    res.status(500).json({ message: 'Internal Server error!' });
        
    }
}

export const getAllUrlDetails = async (req,res) => {
    

    try {
        const userID = req.user.userId;
        const urls = await Url.find({user:userID}).sort({ createdAt: -1 });
        res.status(201).json(urls);
    } catch (error) {
        console.error('Error fetching URLs:', error);
    res.status(500).json({ message: 'Internal Server error!' });
        
    }
}

export const updateUrl =async (req,res) => {
    try {
        const userId = req.user.userId;
        const urlid = req.params.id;
        const { originalUrl, shortCode } = req.body;

        const thisurl = await Url.findOne({ _id: urlid, user: userId });
        if (!thisurl) {
            res.status(401).json({message:"this url does not exist"})
        }

        if (shortCode && shortCode !== thisurl.shortCode) {
            const existingurl = await Url.findOne({ shortCode });
            if (existingurl) {
                return res.status(409).json({ message: 'shortCode already in use.' });
            }
            thisurl.shortCode = shortCode;
        }

        if (originalUrl) {
            thisurl.originalUrl = originalUrl;
        }

        await thisurl.save();
        res.status(201).json({message:"successfully updated the url"})


    } catch (error) {
        console.error('Error updating URL:', error);
    res.status(500).json({ message: 'Internal Server error!' });
        
    }
}
export const deleteUrl = async (req,res) => {
    try {
        const userId = req.user.userId;
        const urlid = req.params.id;

        const thisurl = await Url.findOneAndDelete({ _id: urlid, user: userId });
        if (!thisurl) {
            res.status(404).json({ message: 'this url does not exist!' });

        }
        res.status(201).json({ message: `Url ${thisurl.shortCode} has been successfully deleted!` });


    } catch (error) {
        console.error('Error deleting URL:', error);
    res.status(500).json({ message: 'Internal Server error!' });
        
    }
}

export const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found.' });
    }

    
    url.clicks += 1;
    await url.save();

    // redirect to the original URL
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    return res.status(500).json({ message: 'Server error during redirect.' });
  }
};