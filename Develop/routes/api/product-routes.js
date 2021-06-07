const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint
// get all products
router.get('/', async (request, response) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [
        Category,
        {
          model: Tag,
          through: ProductTag
        }],
    });
    response.status(200).json(productData);
  } catch (error) {
    response.status(500).json(error);
  }
});
// get one product
router.get('/:id', async (request, response) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(request.params.id,
      {
        include: [
          Category,
          {
            model: Tag,
            through: ProductTag
          }],
      });
    response.status(200).json(productData);
  } catch (error) {
    response.status(500).json(error);
  }
});

// create new product
router.post('/', async (request, response) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    let product = await Product.create(request.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model

    if (request.body.tagIds.length) {
      const productTagIdArr = request.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      let addTags = await ProductTag.bulkCreate(productTagIdArr);
      let finalUpdatedProduct = [];
      finalUpdatedProduct.push(product);
      finalUpdatedProduct.push(addTags);
      response.status(200).json(finalUpdatedProduct);
    } else {
      // if no product tags, just respond
      response.status(200).json(product);
    }
  } catch (error) {
    response.status(400).json(error);
  }
});

// update product
router.put('/:id', async (request, response) => {
  try {
    let product = await Product.update(request.body, {
      where: {
        id: request.params.id,
      },
    })
    let productTags = await ProductTag.findAll({ where: { product_id: request.params.id } });
    // get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    // create filtered list of new tag_ids
    const newProductTags = request.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: request.params.id,
          tag_id,
        };
      });

    // figure out which tags to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !request.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Destory all existing tags and then add in the new tags
    const updatedProductTags = Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
    
    response.status(200).json(product);
  } catch (error) {
    response.status(400).json(error);
  }
});

router.delete('/:id', async (request, response) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: request.params.id,
      },
    });

    if (!productData) {
      response.status(404).json({ message: 'No Product for id ' + request.params.id + ' was found, so it was not deleted' });
      return;
    }

    response.status(200).json(productData);
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
