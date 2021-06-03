const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (request, response) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [Product],
    });
    response.status(200).json(categoryData);
  } catch (error) {
    response.status(500).json(error);
  }
});

router.get('/:id', async (request, response) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(request.params.id,
      {
        include: [Product]
      });

    if (!categoryData) {
      response.status(404).json({ message: 'Category was not found for id ' + request.params.id });
      return;
    }

    response.status(200).json(categoryData);
  } catch (error) {
    response.status(404).json(error);
  }
});

router.post('/', async (request, response) => {
  // create a new category
  try {
    const categoryData = Category.create(request.body);
    return response.status(200).json(categoryData);
  } catch (error) {
    response.status(error).json({ message: 'Category was not added' });
  };
});

router.put('/:id', async (request, response) => {
  // update a category by its `id` value
  try {
    let categoryUpdated = await Category.update(
      { category_name: request.body.category_name },
      {
        returning: true, where: { id: request.params.id }
      })
    response.status(200).json(categoryUpdated);
  } catch (error) {
    response.status(400).json(error);
  }
});

router.delete('/:id', async (request, response) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: request.params.id,
      },
    });

    if (!categoryData) {
      response.status(404).json({ message: 'Category for id ' + request.params.id + 'was not deleted' });
      return;
    }

    response.status(200).json(categoryData);
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
