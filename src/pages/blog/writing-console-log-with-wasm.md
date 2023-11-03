---
layout: "../../layouts/BlogPost.astro"
title: "Implementing console.log with just wasm and rust"
description: "implementing console.log in rust with wasm and no third party libraries"
pubDate: "Nov 3 2023"
---

Since you sadly can't directly send strings back to javascript we instead have to use pointers and uint8arrays to send data back to javascript,

```rs
pub mod console {
    mod console_js {
        #[link(wasm_import_module = "console")]
        extern "C" {
            pub fn console_log(ptr: *const u8, len: usize);
        }
    }

    pub fn console_log(ptr: *const u8, len: usize) {
        unsafe { console_js::console_log(ptr, len) }
    }
}

pub fn log(s: &str) {
    console::console_log(s.as_ptr(), s.len());
}

#[no_mangle]
pub unsafe extern "C" fn log(
    input: *const u8,
    input_size: usize
) {
    let input_data = std::slice::from_raw_parts(input, input_size);

    let string = String::from_utf8_lossy(input_data);

    log(&string);
}

#[no_mangle]
pub unsafe extern "C" fn __alloc(length: usize) -> *const u8 {
    let l = std::alloc::Layout::array::<u8>(length).unwrap();
    std::alloc::alloc(l)
}

#[no_mangle]
pub unsafe extern "C" fn __dealloc(ptr: *mut u8, length: usize) {
    let l = std::alloc::Layout::array::<u8>(length).unwrap();
    std::alloc::dealloc(ptr, l);
}

```

And the following javascript code

```ts
const textDecoder = new TextDecoder("utf-8");

const importObject: WebAssembly.Imports = {
  console: {
    console_log: function (ptr: number, len: number) {
      const message = uint8ToString(new Uint8Array(memory.buffer, ptr, len));
      console.log(message);
      // we deallocate the message so that we dont create a memory leak
      wasm.instance.exports.__dealloc(ptr, len);
    },
  },
};
// deno is a great tool to load wasm modules and try them out locally without having to open a browser
const wasm = await WebAssembly.instantiateStreaming(
  fetch(new URL("library.wasm", import.meta.url)),
  importObject
);

function uint8ToString(data: Uint8Array) {
  return textDecoder.decode(data);
}

function stringToPointer(str: string) {
  const textEncoder = new TextEncoder();
  const encodedString = textEncoder.encode(str);
  const ptr = exports.__alloc(encodedString.length);
  const memoryBuffer = new Uint8Array(memory.buffer);

  for (let i = 0; i < encodedString.length; i++) {
    memoryBuffer[ptr + i] = encodedString[i];
  }

  return { ptr, len: encodedString.length };
}

const { ptr, len } = stringToPointer("Hello World");

wasm.instance.exports.log(ptr, len);
```

As you can see its a lot of code to just print something simple to the console with rust and no third party libraries, but this does allow for a more flexible way to make modules that are smaller and more portable without having to use the glue code wasm_bindgen generates.

I created a more complex example that includes compressing and a ron decoder and encoder in wasm that uses just 200kb of wasm code you can find the repository here <https://github.com/Tricked-dev/rustwasmboilerplate>.

I am pretty new to wasm and low level coding like this and if you have a better way to these sorts of things either faster or shorter feel free to make a pull request to the repo!

## Conclusion

with this article i want to shine some light on creating wasm modules without using the wasm_bindgen or other glue code libraries.
