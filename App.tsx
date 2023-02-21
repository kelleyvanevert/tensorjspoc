import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    tf.ready().then(() => setReady(true));
  }, [setReady]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text>Open up App.tsx to start working on your app!</Text>
      <Text style={{ marginTop: 24 }}>Constants:</Text>
      <Text>
        {Constants.deviceName}, {Constants.statusBarHeight}
      </Text>

      <Text style={{ marginTop: 24 }}>Tf ready?</Text>
      <Text>{ready ? "YES" : "no"}</Text>

      <Text style={{ marginTop: 30 }}>GL:</Text>
      <GLView
        style={{ width: 300, height: 300 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

function onContextCreate(gl: ExpoWebGLRenderingContext) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);

  // Create vertex shader (shape & position)
  const vert = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(
    vert,
    `
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 150.0;
    }
  `
  );
  gl.compileShader(vert);

  // Create fragment shader (color)
  const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(
    frag,
    `
    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `
  );
  gl.compileShader(frag);

  // Link together into a program
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);

  gl.flush();
  gl.endFrameEXP();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
