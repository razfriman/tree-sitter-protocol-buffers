module.exports = grammar({
  name: "protocol_buffers",
  rules: {
    source_file: ($) => seq($.proto),
    topLevelDef: ($) => choice($.message, $.enum, $.service),
    proto: ($) =>
      seq(
        $.syntax,
        choice($.import, $.package, $.option, $.topLevelDef, $.emptyStatement)
      ),
    rpc: ($) =>
      seq(
        "rpc",
        alias($.ident, "rpcName"),
        "(",
        optional("stream"),
        $.messageType,
        ")",
        "returns",
        "(",
        optional("stream"),
        $.messageType,
        ")",
        choice(seq("{", choice($.option, $.emptyStatement)), ";")
      ),
    service: ($) =>
      seq(
        "service",
        alias($.ident, "serviceName"),
        "{",
        choice($.option, $.rpc, $.emptyStatement),
        "}"
      ),
    messageBody: ($) =>
      seq(
        "{",
        choice(
          $.field,
          $.enum,
          $.message,
          $.option,
          $.oneof,
          $.mapField,
          $.reserved,
          $.emptyStatement
        ),
        "}"
      ),
    message: ($) =>
      seq("message", alias($.ident, "messageName"), $.messageBody),
    enumValueOption: ($) => seq(alias($.ident, "optionName"), "=", $.constant),
    enumField: ($) =>
      seq(
        $.ident,
        "=",
        optional("-"),
        $.intLit,
        optional(
          seq("[", $.enumValueOption, choice(",", $.enumValueOption), "]")
        ),
        ";"
      ),
    enumBody: ($) =>
      seq("{", choice($.option, $.enumField, $.emptyStatement), "}"),
    enum: ($) => seq("enum", alias($.ident, "enumName"), $.enumBody),
    fieldNames: ($) =>
      seq(
        alias($.ident, "fieldName"),
        repeat(seq(",", alias($.ident, "fieldName")))
      ),
    range: ($) => seq($.intLit, optional(seq("to", choice($.intLit, "max")))),
    ranges: ($) => seq($.range, repeat(seq(",", $.range))),
    reserved: ($) => seq("reserved", choice($.ranges, $.fieldNames), ";"),
    oneof: ($) =>
      seq(
        "oneof",
        alias($.ident, "oneofName"),
        "{",
        repeat(choice($.option, $.oneofField, $.emptyStatement)),
        "}"
      ),
    oneofField: ($) =>
      seq(
        $.type,
        alias($.ident, "fieldName"),
        "=",
        $.fieldNumber,
        optional(seq("[", $.fieldOptions, "]")),
        ";"
      ),
    mapField: ($) =>
      seq(
        "map",
        "<",
        $.keyType,
        ",",
        $.type,
        ">",
        alias($.ident, "mapName"),
        "=",
        $.fieldNumber,
        optional(seq("[", $.fieldOptions, "]")),
        ";"
      ),
    keyType: ($) =>
      choice(
        "int32",
        "int64",
        "uint32",
        "uint64",
        "sint32",
        "sint64",
        "fixed32",
        "fixed64",
        "sfixed32",
        "sfixed64",
        "bool",
        "string"
      ),
    ident: ($) => seq($.letter, repeat(choice($.letter, $.decimalDigit, "_"))),
    fullIdent: ($) => seq($.ident, repeat(seq(".", $.ident))),
    messageType: ($) =>
      seq(
        optional("."),
        repeat(seq($.ident, ".")),
        alias($.ident, "messageName")
      ),
    enumType: ($) =>
      seq(optional("."), repeat(seq($.ident, ".")), alias($.ident, "enunName")),
    intLit: ($) => choice($.decimalLit, $.octalLit, $.hexLit),
    decimalLit: ($) => seq($.decimalDigit, repeat($.decimalDigit)),
    octalLit: ($) => seq("0", repeat($.octalDigit)),
    hexLit: ($) => seq("0", choice("x", "X"), $.hexDigit, repeat($.hexDigit)),
    floatLit: ($) =>
      choice(
        seq($.decimals, ".", optional($.decimals), optional($.exponent)),
        seq($.decimals, $.exponent),
        seq(".", $.decimals, optional($.exponent)),
        "inf",
        "nan"
      ),
    decimals: ($) => seq($.decimalDigit, repeat($.decimalDigit)),
    exponent: ($) =>
      seq(choice("e", "E"), optional(choice("+", "-")), $.decimals),
    strLit: ($) =>
      choice(
        seq("'", repeat($.charValue), "'"),
        seq('"', repeat($.charValue), '"')
      ),
    charValue: ($) => choice($.hexEscape, $.octEscape, $.charEscape), // or /[^\0\n\\]/
    hexEscape: ($) => seq("\\", choice("x", "X"), $.hexDigit, $.hexDigit),
    octEscape: ($) => seq("\\", $.octalDigit, $.octalDigit, $.octalDigit),
    charEscape: ($) =>
      seq("\\", choice("a", "b", "f", "n", "r", "t", "v", "\\", "'", '"')),
    quote: ($) => choice('"', "'"),
    emptyStatement: ($) => ";",
    constant: ($) =>
      choice(
        $.fullIdent,
        seq(choice("-", "+"), $.intLit),
        seq(choice("-", "+"), $.floatLit),
        $.strLit,
        $.boolLit
      ),
    syntax: ($) => seq("syntax", "=", $.quote, "proto3", $.quote, ";"),
    import: ($) =>
      seq("import", optional(choice("weak", "public")), $.strLit, ";"),
    package: ($) => seq("package", $.fullIdent, ";"),
    option: ($) =>
      seq("optiona", alias($.ident, "optionName"), "=", $.constant, "="),
    optionName: ($) =>
      seq(
        choice($.ident, seq("(", $.fullIdent, ")")),
        repeat(seq(".", $.ident))
      ),
    type: ($) =>
      choice(
        "double",
        "float",
        "int32",
        "int64",
        "uint32",
        "uint64",
        "sint32",
        "sint64",
        "fixed32",
        "fixed64",
        "sfixed32",
        "sfixed64",
        "bool",
        "string",
        "bytes",
        $.messageType,
        $.enumType
      ),
    fieldNumber: ($) => $.intLit,
    field: ($) =>
      seq(
        optional("repeated"),
        $.type,
        alias($.ident, "fieldName"),
        "=",
        $.fieldNumber,
        optional(seq("[", $.fieldOptions, "]")),
        ";"
      ),
    fieldOptions: ($) =>
      seq(
        optional("repeated"),
        $.type,
        alias($.ident, "fieldName"),
        "=",
        $.fieldNumber,
        optional(seq("[", $.fieldOptions, "]")),
        ";"
      ),
    fieldOption: ($) => seq(alias($.ident, "optionName"), "=", $.constant),
    boolLit: ($) => choice("true", "false"),
    letter: ($) => /[a-z]|[A-Z]/,
    decimalDigit: ($) => /[0-9]/,
    octalDigit: ($) => /[0-7]/,
    hexDigit: ($) => /[0-9]|[A-F]|[a-f]/,
  },
});
