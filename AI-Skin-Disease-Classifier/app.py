"""
NeuralTrust - Multi-Agent Skin Disease Diagnosis System
=========================================================
Flask backend that chains all 5 agents:
  Agent 1 (Gatekeeper)  -> Image quality check
  Agent 2 (Router)      -> Body part detection
  Agent 3 (Face)        -> Facial disease diagnosis
  Agent 4 (Torso)       -> Torso disease diagnosis
  Agent 5 (Limbs)       -> Limbs disease diagnosis
"""

import os
import sys
import time
import uuid
import json
import numpy as np

# CPU-only mode
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename


# Fix for JSON serialization of NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        return super(NumpyEncoder, self).default(obj)


# ── Flask App ──────────────────────────────────────────────────────────────────
app = Flask(__name__)

# Allow CORS from the React dev server (Vite at 5173) and any localhost origin
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]}})

# Import all agents
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agents.agent1_gatekeeper.vision_gatekeeper import VisionGatekeeper
from agents.agent2_router.body_router import route as body_route
from agents.agent3_facial.facial_specialist import predict as predict_face
from agents.agent4_torso.torso_specialist import predict as predict_torso
from agents.agent5_limbs.limbs_specialist import predict as predict_limbs

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'webp'}

# Initialise gatekeeper once at startup
gatekeeper = VisionGatekeeper()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/diagnose', methods=['POST'])
def diagnose():
    """Main diagnosis endpoint – runs the full 5-agent pipeline."""
    start_time = time.time()
    pipeline_log = []

    # Validate upload
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Use JPG, PNG, or BMP'}), 400

    # Save uploaded file temporarily
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # ── AGENT 1: Vision Gatekeeper ──────────────────────────────────────
        a1_start = time.time()
        gate_result = gatekeeper.process(filepath, enhance=True)
        a1_time = round(time.time() - a1_start, 2)

        pipeline_log.append({
            'agent': 'Agent 1 - Vision Gatekeeper',
            'status': gate_result['status'],
            'quality_score': gate_result['quality_score'],
            'checks': {
                k: {'passed': v['passed'], 'reason': v['reason']}
                for k, v in gate_result['checks'].items()
            },
            'time': f'{a1_time}s',
        })

        if gate_result['status'] == 'REJECT':
            total_time = round(time.time() - start_time, 2)
            return app.response_class(
                response=json.dumps({
                    'status': 'rejected',
                    'rejection_reason': gate_result['rejection_reason'],
                    'quality_score': gate_result['quality_score'],
                    'pipeline': pipeline_log,
                    'total_time': f'{total_time}s',
                }, cls=NumpyEncoder),
                status=200,
                mimetype='application/json',
            )

        # ── AGENT 2: Body Part Router ────────────────────────────────────────
        a2_start = time.time()
        route_result = body_route(filepath)
        a2_time = round(time.time() - a2_start, 2)

        body_part = route_result['body_part']
        route_to = route_result['route_to']

        pipeline_log.append({
            'agent': 'Agent 2 - Body Part Router',
            'body_part': body_part,
            'confidence': route_result['confidence'],
            'route_to': route_to,
            'reasoning': route_result['reasoning'],
            'time': f'{a2_time}s',
        })

        # ── AGENT 3 / 4 / 5: Specialist Diagnosis ───────────────────────────
        as_start = time.time()

        if route_to == 'agent3_facial':
            predictions = predict_face(filepath)
            specialist_name = 'Agent 3 - Facial Specialist (EfficientNet + ResNet50)'
        elif route_to == 'agent4_torso':
            predictions = predict_torso(filepath)
            specialist_name = 'Agent 4 - Torso Specialist (ResNet34)'
        else:
            predictions = predict_limbs(filepath)
            specialist_name = 'Agent 5 - Limbs Specialist (ResNet18)'

        as_time = round(time.time() - as_start, 2)
        top_predictions = predictions[:5]

        pipeline_log.append({
            'agent': specialist_name,
            'top_disease': top_predictions[0]['disease'] if top_predictions else 'Unknown',
            'top_probability': top_predictions[0]['probability'] if top_predictions else 0,
            'time': f'{as_time}s',
        })

        total_time = round(time.time() - start_time, 2)

        return app.response_class(
            response=json.dumps({
                'status': 'success',
                'body_part': body_part,
                'specialist': specialist_name,
                'quality_score': gate_result['quality_score'],
                'predictions': top_predictions,
                'pipeline': pipeline_log,
                'total_time': f'{total_time}s',
            }, cls=NumpyEncoder),
            status=200,
            mimetype='application/json',
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return app.response_class(
            response=json.dumps({
                'status': 'error',
                'error': str(e),
                'pipeline': pipeline_log,
            }, cls=NumpyEncoder),
            status=500,
            mimetype='application/json',
        )

    finally:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass


# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 60)
    print("  NeuralTrust - Multi-Agent Skin Disease Diagnosis")
    print("=" * 60)
    print("  Agent 1: Vision Gatekeeper    (OpenCV)")
    print("  Agent 2: Body Part Router     (Haar Cascade)")
    print("  Agent 3: Facial Specialist    (EfficientNet + ResNet50)")
    print("  Agent 4: Torso Specialist     (ResNet34)")
    print("  Agent 5: Limbs Specialist     (ResNet18)")
    print("=" * 60)
    print("  Starting server on http://127.0.0.1:5000")
    print("  CORS enabled for React dev server at localhost:5173")
    print("=" * 60)
    app.run(debug=False, host='127.0.0.1', port=5000)
