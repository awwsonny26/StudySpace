const pool = require('../config/mysql');

const runMysqlDemo = async (req, res) => {
  let demoCategoryId;
  let demoCourseId;

  try {
    const [insertCategoryResult] = await pool.execute(
      'INSERT INTO categories (name, description, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
      ['SQL Demo Category', 'Temporary category created to demonstrate raw mysql2 INSERT.']
    );
    demoCategoryId = insertCategoryResult.insertId;

    const [insertCourseResult] = await pool.execute(
      'INSERT INTO courses (title, description, author, duration, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [
        'Raw MySQL Demo Course',
        'Temporary course created to demonstrate raw mysql2 INSERT.',
        'StudySpace Lab',
        '1 week',
        demoCategoryId
      ]
    );
    demoCourseId = insertCourseResult.insertId;

    const [selectRows] = await pool.execute(
      'SELECT c.id, c.title, c.author, c.duration, cat.name AS categoryName FROM courses c JOIN categories cat ON c.categoryId = cat.id WHERE c.id = ?',
      [demoCourseId]
    );

    await pool.execute(
      'UPDATE courses SET title = ?, updatedAt = NOW() WHERE id = ?',
      ['Updated Raw MySQL Demo Course', demoCourseId]
    );

    const [updatedRows] = await pool.execute(
      'SELECT id, title FROM courses WHERE id = ?',
      [demoCourseId]
    );

    await pool.execute('DELETE FROM courses WHERE id = ?', [demoCourseId]);
    await pool.execute('DELETE FROM categories WHERE id = ?', [demoCategoryId]);

    res.json({
      message: 'Raw mysql2 demo completed successfully.',
      operations: {
        insert: {
          categoryId: demoCategoryId,
          courseId: demoCourseId
        },
        select: selectRows,
        update: updatedRows,
        delete: 'Temporary demo records were deleted.'
      }
    });
  } catch (error) {
    if (demoCourseId) {
      await pool.execute('DELETE FROM courses WHERE id = ?', [demoCourseId]).catch(() => {});
    }

    if (demoCategoryId) {
      await pool.execute('DELETE FROM categories WHERE id = ?', [demoCategoryId]).catch(() => {});
    }

    res.status(500).json({
      message: 'Raw mysql2 demo failed.',
      error: error.message
    });
  }
};

module.exports = {
  runMysqlDemo
};
