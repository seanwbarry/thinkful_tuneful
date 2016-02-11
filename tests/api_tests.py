import unittest
import os
import shutil
import json
try: from urllib.parse import urlparse
except ImportError: from urlparse import urlparse #PY2 compatibility
from io import StringIO

import sys; print(list(sys.modules.keys()))
# configure app to use the testing database
os.environ["CONFIG_PATH"] = "tuneful.config.TestingConfig"

from tuneful import app
from tuneful import models
from tuneful.utils import upload_path
from tuneful.database import Base, engine, session

class TestAPI(unittest.TestCase):
	""" Tests for the  tuneful API """
	
	def setUp(self):
		""" Test setup """
		self.client = app.test_client()

		# Setup the tables in the database
		Base.metadata.create_all(engine)

		# reate folder for test uploads
		os.mkdir(upload_path())

	def tearDown(self):
		""" Test teardown """
		session.close()
		# Remove the tables and their data from the database
		Base.metadata.drop_all(engine)
	
		# Delete test upload folder
		shutil.rmtree(upload_path())
