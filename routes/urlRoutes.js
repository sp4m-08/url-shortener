import express from "express"
import { createUrl, deleteUrl, getAllUrlDetails, getOriginalUrl, redirectToOriginalUrl, updateUrl } from "../controllers/urlController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const urlRouter = express.Router()

urlRouter.post('/submit',authMiddleware, createUrl)
urlRouter.get('/all',authMiddleware,getAllUrlDetails)
urlRouter.get('/:id',authMiddleware,getOriginalUrl)
urlRouter.put('/update/:id',authMiddleware, updateUrl);
urlRouter.delete('/delete/:id', authMiddleware, deleteUrl);
urlRouter.get('/redirect/:shortCode', redirectToOriginalUrl);


export default urlRouter;