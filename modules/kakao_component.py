import streamlit.components.v1 as components
import os

kakao_component_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kakao_map")
kakao_map = components.declare_component("kakao_map", path=kakao_component_path)
