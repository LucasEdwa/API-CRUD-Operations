//Import express and prisma
const express = require('express');
const { PrismaClient } = require('@prisma/client');
//Create an instance of express as app
const app = express();

// prisma is a constructor function that takes no arguments
const prisma = new PrismaClient();
// make the body of the request available as req.body
app.use(express.json());
//Set the port to 2000
const port = 2000;
//CRUD stands for Create, Read, Update, Delete

//Books CRUD

app.post('/create-book/', async (req, res) => {
    try{
        const bookData = req.body;

        if (
            !bookData.title || 
            !bookData.author || 
            !bookData.description ||
            !bookData.published
            )
        {
            res.status(400).send({error: 'You left empty fields.'});
            return;
        }
        
        const book = await prisma.book.create({
            data: {
                title: bookData.title,
                author: bookData.author,
                description: bookData.description,
                published: new Date(bookData.published)
            }
        });     

        res.send({book: book});
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }

});

app.get('/get-books/', async (req, res) => {
    
    const books = await prisma.book.findMany({
        include: {
            reviews: true
        }
    });
    res.send(books);
});
app.get('/get-book/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = await prisma.book.findUnique({
        where: {
            id: bookId
        },
        data: {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            published: new Date(bookData.published)
        },
        include: {
            reviews: true
        }

    });
    res.send(book);
}
);
app.patch('/update-book/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);
    const bookData = req.body;

    try{
        if (
            !bookData.title || 
            !bookData.author || 
            !bookData.description ||
            !bookData.published
            )
        {
            res.status(200).send({error: 'You left empty this fields' + bookData.title + bookData.author + bookData.description + bookData.published});
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
    const book = await prisma.book.update({
        where: { id: bookId },
        data: {
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            published: new Date(bookData.published)
        } 
    });   

    res.status(200).send({success: "Book updated successfully", book : book});

});
app.delete('/delete-book/:id', async (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = await prisma.book.delete({
        where: {
            id: bookId
        }
    });
    res.send({success: "Book deleted successfully" + book.title});
});

//Reviews CRUD
app.post('/add-review/book/:bookId', async (req, res) => {
    const reviewData = req.body;
    const bookId = parseInt(req.params.bookId);
    //ParseInt converts a string to an integer 
    //bc the id is an integer
    if (
        !reviewData.name || 
        !reviewData.text || 
        !reviewData.rating 
        )
        //if not all fields are filled in: error is sent
    {
        res.status(400).send({error: 'You left empty fields.'});
        return;
    }

    try {
        // with await we wait for the promise to resolve
        // we can difine the CRUD operation in a variable
        // in this case we define the create operation
        const review = await prisma.review.create({
            data: {
                // reviewData is the body of the request
                //anexed to name, text and rating
                name: reviewData.name,
                text: reviewData.text,
                rating: parseInt(reviewData.rating),
                //we dont need pass the id or published because they are auto generated
                // here we connect the review to the book
                book: {
                    connect: {
                        // the id of the book is passed in the url
                        id: bookId
                    }
                
                }
            }
        });   //if the review is created successfully, a success message is sent
        res.send({success: "Review created successfully: " + review.id});


    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});
app.get('/get-reviews/', async (req, res) => {
    const reviews = await prisma.review.findMany();
    //findMany is a method that returns all the reviews
    res.send(reviews);
});
app.get('/get-review/:id', async (req, res) => {
    // req.params.id is the id passed in the url
    const reviewId = parseInt(req.params.id);
    //then we can use the findUnique method to find the review
    const review = await prisma.review.findUnique({
        //where is filtering the review by id
        where: {
            id: reviewId
        }
    });
    res.send(review);
});   
app.patch('/update-review/:reviewId', async (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    //here we get the body of the request
    const reviewData = req.body;
    if (!reviewData.name || !reviewData.text || !reviewData.rating)
    {
        res.status(400).send({error: 'You left empty fields.'});
        return;
    }
    const review = await prisma.review.update({
        //where is filtering the review by id
        //will update the name, text and rating
        where: { id: reviewId },
        data: {
            name: reviewData.name,
            text: reviewData.text,
            rating: parseInt(reviewData.rating)
        } 
    });
    res.send({success: "Review updated successfully. User: " + review.name});
});
app.delete('/delete-review/:reviewId', async (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    const deleteReview = await prisma.review.delete({
        where: {
            id: reviewId
        }
    });
    res.send({success: "Review deleted successfully. User: " + deleteReview.name});
});
//Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});